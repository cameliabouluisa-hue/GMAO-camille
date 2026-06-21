'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Boxes,
  Building,
  ChevronDown,
  ChevronRight,
  FolderTree,
  HardDrive,
  MapPin,
  Package,
  RefreshCcw,
  Search,
  Wrench,
} from 'lucide-react';

import {
  ArborescenceMode,
  ArborescenceNode,
} from '../types/arborescence.types';

type Props = {
  data: ArborescenceNode[];
  mode: ArborescenceMode;
  canOpenPointStructureDetail: boolean;
};

function getNodeIcon(type?: string | null) {
  switch (type) {
    case 'ROOT':
      return {
        icon: <FolderTree size={18} />,
        iconClass: 'bg-[#06475a] text-white',
      };

    case 'FAMILLE':
      return {
        icon: <Boxes size={18} />,
        iconClass: 'bg-violet-50 text-violet-700',
      };

    case 'MODELE':
      return {
        icon: <Box size={18} />,
        iconClass: 'bg-blue-50 text-blue-700',
      };

    case 'ARTICLE':
      return {
        icon: <Package size={18} />,
        iconClass: 'bg-emerald-50 text-emerald-700',
      };

    case 'MATERIEL':
      return {
        icon: <HardDrive size={18} />,
        iconClass: 'bg-orange-50 text-orange-700',
      };

    case 'POINT_STRUCTURE':
      return {
        icon: <MapPin size={18} />,
        iconClass: 'bg-cyan-50 text-cyan-700',
      };

    default:
      return {
        icon: <Wrench size={18} />,
        iconClass: 'bg-slate-100 text-slate-500',
      };
  }
}

function getModeLabel(mode: ArborescenceMode) {
  if (mode === 'GEOGRAPHIQUE') return 'Arborescence géographique';
  if (mode === 'TECHNIQUE') return 'Arborescence technique';
  return 'Arborescence familles';
}

function getModeIcon(mode: ArborescenceMode) {
  if (mode === 'GEOGRAPHIQUE') return <Building size={24} />;
  if (mode === 'TECHNIQUE') return <Wrench size={24} />;
  return <FolderTree size={24} />;
}

function getChildren(node: ArborescenceNode) {
  return node.children ?? [];
}

function removeGroupNodes(nodes: ArborescenceNode[]): ArborescenceNode[] {
  return nodes.flatMap((node) => {
    const children = removeGroupNodes(getChildren(node));

    if (node.type === 'GROUP_MODELES' || node.type === 'GROUP_ARTICLES') {
      return children;
    }

    return [
      {
        ...node,
        children,
      },
    ];
  });
}

function getNodeLabel(node: ArborescenceNode) {
  return node.libelle || node.code || `Élément ${node.id}`;
}

function getNodeKey(node: ArborescenceNode) {
  return node.key || `${node.type}-${node.id}`;
}

function getNodeHref(
  node: ArborescenceNode,
  canOpenPointStructureDetail: boolean,
) {
  if (!canOpenPointStructureDetail) {
    return null;
  }

  switch (node.type) {
    case 'FAMILLE':
      return `/familles/${node.id}`;

    case 'MODELE':
      return `/modeles/${node.id}`;

    case 'ARTICLE':
      return `/articles/${node.id}`;

    case 'MATERIEL':
      return `/materiels/${node.id}`;

    case 'POINT_STRUCTURE':
      return `/points-structure/${node.id}`;

    default:
      return null;
  }
}

function filterTree(
  nodes: ArborescenceNode[],
  search: string,
): ArborescenceNode[] {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) return nodes;

  return nodes
    .map((node) => {
      const children = filterTree(getChildren(node), search);

      const currentMatch = [node.code, node.libelle, node.type]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(normalizedSearch),
        );

      if (currentMatch || children.length > 0) {
        return {
          ...node,
          children,
        };
      }

      return null;
    })
    .filter((node): node is ArborescenceNode => Boolean(node));
}

export default function TreeView({
  data,
  mode,
  canOpenPointStructureDetail,
}: Props) {
  const [search, setSearch] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  const normalizedData = useMemo(() => {
    return removeGroupNodes(data);
  }, [data]);

  useEffect(() => {
    const initial = new Set<string>();

    function collect(nodes: ArborescenceNode[], level = 0) {
      for (const node of nodes) {
        if (level <= 2) {
          initial.add(getNodeKey(node));
        }

        collect(getChildren(node), level + 1);
      }
    }

    collect(normalizedData);
    setExpandedKeys(initial);
  }, [normalizedData]);

  const filteredData = useMemo(() => {
    return filterTree(normalizedData, search);
  }, [normalizedData, search]);

  function toggleNode(key: string) {
    setExpandedKeys((prev) => {
      const next = new Set(prev);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  }

  function handleRefresh() {
    window.location.reload();
  }

  return (
    <div className="space-y-5 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full max-w-xl">
          <Search
            size={20}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher par libellé..."
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#06475a] focus:bg-white focus:ring-4 focus:ring-[#06475a]/10"
          />
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCcw size={18} />
          Actualiser
        </button>
      </div>

      <div className="rounded-[26px] border border-slate-200 bg-slate-50/70 p-5">
        <div className="mb-5 flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-[#06475a]">
            {getModeIcon(mode)}
          </div>

          <div>
            <h3 className="text-lg font-black text-slate-950">
              {getModeLabel(mode)}
            </h3>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              Consultez l’organisation des équipements sous forme hiérarchique.
            </p>
          </div>
        </div>

        {filteredData.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
            <p className="text-sm font-bold text-slate-500">
              Aucun élément trouvé.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredData.map((node) => (
              <TreeNode
                key={getNodeKey(node)}
                node={node}
                level={0}
                expandedKeys={expandedKeys}
                onToggle={toggleNode}
                canOpenPointStructureDetail={canOpenPointStructureDetail}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TreeNode({
  node,
  level,
  expandedKeys,
  onToggle,
  canOpenPointStructureDetail,
}: {
  node: ArborescenceNode;
  level: number;
  expandedKeys: Set<string>;
  onToggle: (key: string) => void;
  canOpenPointStructureDetail: boolean;
}) {
  const children = getChildren(node);
  const hasChildren = children.length > 0;
  const key = getNodeKey(node);
  const isExpanded = expandedKeys.has(key);
  const label = getNodeLabel(node);
  const { icon, iconClass } = getNodeIcon(node.type);
  const href = getNodeHref(node, canOpenPointStructureDetail);

  const content = (
    <div
      className={`flex min-h-12 flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition ${
        href ? 'hover:border-[#06475a]/30 hover:bg-cyan-50/40' : ''
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-black text-slate-900">{label}</p>

        <div className="mt-1 flex flex-wrap items-center gap-2">
          {node.code && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-500">
              {node.code}
            </span>
          )}

          {node.type && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-500">
              {node.type}
            </span>
          )}
        </div>
      </div>

      {!href && (
        <span className="text-xs font-bold text-slate-400">
          Consultation seule
        </span>
      )}
    </div>
  );

  return (
    <div>
      <div
        className="flex items-start gap-2"
        style={{ paddingLeft: `${level * 24}px` }}
      >
        <button
          type="button"
          onClick={() => hasChildren && onToggle(key)}
          disabled={!hasChildren}
          className="mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown size={18} />
            ) : (
              <ChevronRight size={18} />
            )
          ) : (
            <span className="h-2 w-2 rounded-full bg-slate-300" />
          )}
        </button>

        {href ? (
          <Link href={href} className="block flex-1">
            {content}
          </Link>
        ) : (
          <div className="flex-1">{content}</div>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-2 space-y-2">
          {children.map((child) => (
            <TreeNode
              key={getNodeKey(child)}
              node={child}
              level={level + 1}
              expandedKeys={expandedKeys}
              onToggle={onToggle}
              canOpenPointStructureDetail={canOpenPointStructureDetail}
            />
          ))}
        </div>
      )}
    </div>
  );
}