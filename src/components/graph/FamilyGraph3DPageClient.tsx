"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GraphModeSwitch from "@/components/graph/GraphModeSwitch";
import GraphRelationshipSummary from "@/components/graph/GraphRelationshipSummary";
import ForceGraph3D, {
  type ForceGraphMethods,
  type GraphData,
  type LinkObject,
  type NodeObject,
} from "react-force-graph-3d";
import * as THREE from "three";
import type { FamilyGraphPayload } from "@/server/families/read-family-graph";

type RelationshipType = "PARENT_OF" | "SPOUSE_OF" | "SIBLING_OF";

type StarNode = {
  id: string;
  name: string;
  avatarUrl: string | null;
  memberId: string;
  birthYear: number | null;
  deathYear: number | null;
  maintenanceRole: string;
  source: string;
  degree: number;
};

type StarLink = {
  source: string | StarGraphNode;
  target: string | StarGraphNode;
  relationshipType: RelationshipType | string;
};

type StarGraphNode = NodeObject<StarNode>;
type StarGraphLink = LinkObject<StarNode, StarLink>;
type StarGraphData = GraphData<StarNode, StarLink>;

const RELATIONSHIP_LABELS: Record<string, string> = {
  PARENT_OF: "父母关系",
  SPOUSE_OF: "夫妻关系",
  SIBLING_OF: "兄弟姐妹",
};

const RELATIONSHIP_COLORS: Record<string, string> = {
  PARENT_OF: "#f59e0b",
  SPOUSE_OF: "#fb7185",
  SIBLING_OF: "#34d399",
};

const avatarTextureCache = new Map<string, THREE.CanvasTexture>();

function isStarNode(value: StarGraphLink["source"]): value is StarGraphNode {
  return typeof value === "object" && value !== null;
}

function getEndpointId(value: StarGraphLink["source"]) {
  return isStarNode(value) ? String(value.id) : String(value);
}

function getNodeOpacity(
  nodeId: string,
  selectedNodeId: string | null,
  neighborIds: Set<string>
) {
  if (!selectedNodeId) return 0.92;
  if (nodeId === selectedNodeId) return 1;
  if (neighborIds.has(nodeId)) return 0.88;
  return 0.18;
}

function getNodeRadius(
  node: StarGraphNode,
  selectedNodeId: string | null,
  neighborIds: Set<string>
) {
  const baseRadius = 4.8 + Math.min(node.degree, 12) * 0.85;
  if (node.id === selectedNodeId) return baseRadius * 1.85;
  if (neighborIds.has(String(node.id))) return baseRadius * 1.18;
  return baseRadius;
}

function buildGraphData(payload: FamilyGraphPayload): StarGraphData {
  const degreeByNodeId = new Map<string, number>();

  for (const node of payload.nodes) {
    degreeByNodeId.set(node.id, 0);
  }

  for (const edge of payload.edges) {
    degreeByNodeId.set(edge.source, (degreeByNodeId.get(edge.source) ?? 0) + 1);
    degreeByNodeId.set(edge.target, (degreeByNodeId.get(edge.target) ?? 0) + 1);
  }

  return {
    nodes: payload.nodes.map((node) => ({
      id: node.id,
      name: node.data.fullName,
      avatarUrl: node.data.avatarUrl,
      memberId: node.data.memberId,
      birthYear: node.data.birthYear,
      deathYear: node.data.deathYear,
      maintenanceRole: node.data.maintenanceRole,
      source: node.data.source,
      degree: degreeByNodeId.get(node.id) ?? 0,
    })),
    links: payload.edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
      relationshipType: edge.data.relationshipType,
    })),
  };
}

function createNodeObject(
  node: StarGraphNode,
  selectedNodeId: string | null,
  neighborIds: Set<string>
) {
  const nodeId = String(node.id);
  const opacity = getNodeOpacity(nodeId, selectedNodeId, neighborIds);
  const radius = getNodeRadius(node, selectedNodeId, neighborIds);
  const isSelected = nodeId === selectedNodeId;
  const isNeighbor = neighborIds.has(nodeId);

  const group = new THREE.Group();
  const ringColor = isSelected ? "#fbbf24" : isNeighbor ? "#38bdf8" : "#93c5fd";

  const glowGeometry = new THREE.SphereGeometry(radius * 0.88, 24, 24);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: ringColor,
    transparent: true,
    opacity: Math.min(opacity, isSelected ? 0.42 : 0.2),
    depthWrite: false,
    depthTest: false,
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  glow.renderOrder = 1;
  group.add(glow);

  const avatarTexture = createAvatarTexture(node);
  const avatarMaterial = new THREE.SpriteMaterial({
    map: avatarTexture,
    transparent: true,
    opacity,
    depthWrite: false,
    depthTest: false,
  });
  const avatar = new THREE.Sprite(avatarMaterial);
  avatar.scale.set(radius * 2.45, radius * 2.45, 1);
  avatar.renderOrder = 10;
  group.add(avatar);

  return group;
}

function createAvatarTexture(node: StarGraphNode) {
  const cacheKey = `${node.id}:${node.avatarUrl ?? "initials"}:${node.name}`;
  const cached = avatarTextureCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;

  drawInitialsAvatar(canvas, node.name);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  avatarTextureCache.set(cacheKey, texture);

  if (node.avatarUrl) {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      drawPhotoAvatar(canvas, image);
      texture.needsUpdate = true;
    };
    image.onerror = () => {
      drawInitialsAvatar(canvas, node.name);
      texture.needsUpdate = true;
    };
    image.src = node.avatarUrl;
  }

  return texture;
}

function drawInitialsAvatar(canvas: HTMLCanvasElement, name: string) {
  const context = canvas.getContext("2d");
  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    const gradient = context.createLinearGradient(0, 0, 256, 256);
    gradient.addColorStop(0, "#bae6fd");
    gradient.addColorStop(1, "#312e81");
    context.save();
    context.beginPath();
    context.arc(128, 128, 118, 0, Math.PI * 2);
    context.clip();
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);
    context.restore();

    context.fillStyle = "rgba(255,255,255,0.92)";
    context.font = "700 76px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(getInitials(name), 128, 132);

    drawAvatarBorder(context);
  }
}

function drawPhotoAvatar(canvas: HTMLCanvasElement, image: HTMLImageElement) {
  const context = canvas.getContext("2d");
  if (!context) return;

  const size = 256;
  const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
  const sourceX = (image.naturalWidth - sourceSize) / 2;
  const sourceY = (image.naturalHeight - sourceSize) / 2;

  context.clearRect(0, 0, size, size);
  context.save();
  context.beginPath();
  context.arc(size / 2, size / 2, 118, 0, Math.PI * 2);
  context.clip();
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    10,
    10,
    236,
    236
  );
  context.restore();

  drawAvatarBorder(context);
}

function drawAvatarBorder(context: CanvasRenderingContext2D) {
  context.beginPath();
  context.arc(128, 128, 120, 0, Math.PI * 2);
  context.lineWidth = 12;
  context.strokeStyle = "rgba(186,230,253,0.92)";
  context.stroke();

  context.beginPath();
  context.arc(128, 128, 126, 0, Math.PI * 2);
  context.lineWidth = 3;
  context.strokeStyle = "rgba(251,191,36,0.78)";
  context.stroke();
}

function getInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

function getMemberDates(node: StarGraphNode) {
  const birth = node.birthYear ?? "未知";
  const death = node.deathYear ? ` - ${node.deathYear}` : "";
  return `${birth}${death}`;
}

export default function FamilyGraph3DPageClient({
  familyId,
}: {
  familyId: string;
}) {
  const router = useRouter();
  const graphRef = useRef<ForceGraphMethods<StarNode, StarLink> | undefined>(
    undefined
  );
  const lastClickRef = useRef<{ nodeId: string; at: number } | null>(null);

  const [payload, setPayload] = useState<FamilyGraphPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadGraph() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/v1/families/${familyId}/graph`, {
          signal: controller.signal,
        });
        const json = await response.json();

        if (!response.ok) {
          setError(json?.error?.message ?? "无法加载 3D 家族星图。");
          return;
        }

        setPayload(json.data);
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === "AbortError") {
          return;
        }
        setError("网络错误，无法加载 3D 家族星图。");
      } finally {
        setLoading(false);
      }
    }

    void loadGraph();

    return () => controller.abort();
  }, [familyId]);

  const graphData = useMemo(
    () => (payload ? buildGraphData(payload) : null),
    [payload]
  );

  const neighborIds = useMemo(() => {
    const ids = new Set<string>();
    if (!selectedNodeId || !graphData) return ids;

    for (const link of graphData.links) {
      const sourceId = getEndpointId(link.source);
      const targetId = getEndpointId(link.target);

      if (sourceId === selectedNodeId) ids.add(targetId);
      if (targetId === selectedNodeId) ids.add(sourceId);
    }

    return ids;
  }, [graphData, selectedNodeId]);

  const selectedNode = useMemo(() => {
    if (!selectedNodeId || !graphData) return null;
    return graphData.nodes.find((node) => node.id === selectedNodeId) ?? null;
  }, [graphData, selectedNodeId]);

  const focusNode = useCallback((node: StarGraphNode) => {
    setSelectedNodeId(String(node.id));

    const x = node.x ?? 0;
    const y = node.y ?? 0;
    const z = node.z ?? 0;
    const distance = 120;
    const length = Math.hypot(x, y, z);
    const ratio = length === 0 ? 1 : 1 + distance / length;

    graphRef.current?.cameraPosition(
      { x: x * ratio, y: y * ratio, z: z * ratio + distance },
      { x, y, z },
      900
    );
  }, []);

  const openMember = useCallback(
    (memberId: string) => {
      router.push(`/families/${familyId}/members/${memberId}`);
    },
    [familyId, router]
  );

  const handleNodeClick = useCallback(
    (node: StarGraphNode) => {
      const nodeId = String(node.id);
      const now = Date.now();
      const previous = lastClickRef.current;

      focusNode(node);

      if (previous?.nodeId === nodeId && now - previous.at < 350) {
        openMember(node.memberId);
      }

      lastClickRef.current = { nodeId, at: now };
    },
    [focusNode, openMember]
  );

  const resetFocus = useCallback(() => {
    setSelectedNodeId(null);
    graphRef.current?.zoomToFit(700, 80);
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
        <p className="text-sm text-slate-300">正在加载 3D 家族星图...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
        <section className="max-w-md rounded-2xl border border-red-400/30 bg-red-950/30 p-6 text-center shadow-2xl shadow-red-950/30">
          <h1 className="text-lg font-semibold text-red-100">
            3D 家族星图加载失败
          </h1>
          <p className="mt-2 text-sm text-red-200">{error}</p>
          <Link
            href={`/families/${familyId}`}
            className="mt-5 inline-flex rounded-lg border border-red-200/30 px-4 py-2 text-sm font-medium text-red-50 transition hover:bg-red-100/10"
          >
            返回家族主页
          </Link>
        </section>
      </main>
    );
  }

  if (!payload || !graphData || graphData.nodes.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
        <section className="max-w-md rounded-2xl border border-slate-700 bg-slate-900/80 p-6 text-center">
          <h1 className="text-lg font-semibold">暂无可展示的家族关系</h1>
          <p className="mt-2 text-sm text-slate-400">
            添加成员和关系后，这里会生成沉浸式 3D 家族星图。
          </p>
          <Link
            href={`/families/${familyId}`}
            className="mt-5 inline-flex rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-800"
          >
            返回家族主页
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#172554_0%,#020617_42%,#000_100%)] text-slate-100">
      <section className="relative flex min-h-screen flex-col">
        <header className="z-10 flex flex-col gap-4 border-b border-white/10 bg-slate-950/70 px-5 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-cyan-200/70">
              {payload.family.name}
            </p>
            <h1 className="mt-1 text-2xl font-semibold">3D 家族星图</h1>
            <p className="mt-1 text-sm text-slate-400">
              拖动旋转，滚轮缩放，点击节点聚焦
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            <GraphModeSwitch familyId={familyId} activeMode="3d" tone="dark" />
            <Link
              href={`/families/${familyId}`}
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
            >
              返回家族主页
            </Link>
            {selectedNode ? (
              <button
                type="button"
                onClick={() => openMember(selectedNode.memberId)}
                className="rounded-lg bg-amber-300 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
              >
                查看详情
              </button>
            ) : null}
          </nav>
        </header>

        <div className="pointer-events-none absolute left-5 top-32 z-10 flex max-w-xs flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/55 p-4 shadow-2xl shadow-black/40 backdrop-blur">
          <div className="flex items-center justify-between gap-4 text-xs text-slate-300">
            <span>{graphData.nodes.length} 位成员</span>
            <span>{graphData.links.length} 条关系</span>
          </div>
          <div className="space-y-2 text-xs text-slate-300">
            <LegendDot color="#f59e0b" label="父母关系" />
            <LegendDot color="#fb7185" label="夫妻关系" />
            <LegendDot color="#34d399" label="兄弟姐妹" />
          </div>
          {selectedNode ? (
            <div className="border-t border-white/10 pt-3">
              <p className="text-sm font-semibold text-white">
                {selectedNode.name}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                生卒年份：{getMemberDates(selectedNode)}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                连接度：{selectedNode.degree}
              </p>
              <div className="mt-3 border-t border-white/10 pt-3">
                <p className="mb-2 text-xs font-semibold text-cyan-100">
                  推导关系摘要
                </p>
                <GraphRelationshipSummary
                  familyId={familyId}
                  memberId={selectedNode.memberId}
                  tone="dark"
                />
              </div>
            </div>
          ) : (
            <p className="border-t border-white/10 pt-3 text-xs text-slate-400">
              点击任意星点，可聚焦成员并高亮相邻关系。
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={resetFocus}
          className="absolute bottom-5 right-5 z-10 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium text-slate-100 shadow-lg shadow-black/30 backdrop-blur transition hover:bg-white/15"
        >
          重置视角
        </button>

        <div className="h-[calc(100vh-105px)] w-full">
          <ForceGraph3D<StarNode, StarLink>
            ref={graphRef}
            graphData={graphData}
            nodeId="id"
            backgroundColor="rgba(0,0,0,0)"
            showNavInfo={false}
            enableNavigationControls
            nodeThreeObject={(node) =>
              createNodeObject(node, selectedNodeId, neighborIds)
            }
            nodeLabel={(node) =>
              `${node.name}<br/>连接度：${node.degree}<br/>${getMemberDates(node)}`
            }
            linkLabel={(link) =>
              RELATIONSHIP_LABELS[link.relationshipType] ??
              link.relationshipType
            }
            linkColor={(link) => {
              const sourceId = getEndpointId(link.source);
              const targetId = getEndpointId(link.target);
              const related =
                !selectedNodeId ||
                sourceId === selectedNodeId ||
                targetId === selectedNodeId;
              const color =
                RELATIONSHIP_COLORS[link.relationshipType] ?? "#94a3b8";
              return related ? color : "rgba(148, 163, 184, 0.16)";
            }}
            linkWidth={(link) => {
              const sourceId = getEndpointId(link.source);
              const targetId = getEndpointId(link.target);
              return selectedNodeId &&
                (sourceId === selectedNodeId || targetId === selectedNodeId)
                ? 1.8
                : 0.55;
            }}
            linkDirectionalArrowLength={(link) =>
              link.relationshipType === "PARENT_OF" ? 4 : 0
            }
            linkDirectionalArrowRelPos={0.82}
            linkOpacity={0.46}
            cooldownTicks={120}
            warmupTicks={80}
            d3VelocityDecay={0.35}
            onNodeClick={handleNodeClick}
            onBackgroundClick={resetFocus}
          />
        </div>
      </section>
    </main>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span>{label}</span>
    </div>
  );
}
