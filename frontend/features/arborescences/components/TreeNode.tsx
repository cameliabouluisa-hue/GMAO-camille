'use client';

import {
  Box,
  Boxes,
  ChevronDown,
  ChevronRight,
  Layers3,
  MapPinned,
  Package,
  Wrench,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MouseEvent, useState } from 'react';

import { ArborescenceNode } from '../types/arborescence.types';

type Props = {
  node: ArborescenceNode;
  level: number;
};

function getDetailHref(node: ArborescenceNode) {
  if (node.type === 'POINT_STRUCTURE') {
    return `/points-structure/${node.id}`;
  }

  if (node.type === 'FAMILLE') {
    return `/familles/${node.id}`;
  }

  if (node.type === 'MODELE') {
    return `/modeles/${node.id}`;
  }

  if (node.type === 'ARTICLE') {
    return `/articles/${node.id}/modifier/`;
  }

  if (node.type === 'MATERIEL') {
    return `/materiels/${node.id}`;
  }

  return null;
}

export default function TreeNode({ node, level }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const hasChildren = node.children && node.children.length > 0;

  const isPointStructure = node.type === 'POINT_STRUCTURE';
  const isMateriel = node.type === 'MATERIEL';
  const isFamille = node.type === 'FAMILLE';
  const isModele = node.type === 'MODELE';
  const isArticle = node.type === 'ARTICLE';

  const isTechnique = node.typePoint === 'TECHNIQUE';
  const isGeographique = node.typePoint === 'GEOGRAPHIQUE';

  const href = getDetailHref(node);

  const icon = isFamille ? (
    <Boxes size={18} />
  ) : isModele ? (
    <Layers3 size={18} />
  ) : isArticle ? (
    <Box size={18} />
  ) : isMateriel ? (
    <Package size={18} />
  ) : isTechnique ? (
    <Wrench size={18} />
  ) : isGeographique ? (
    <MapPinned size={18} />
  ) : isPointStructure ? (
    <MapPinned size={18} />
  ) : (
    <Box size={18} />
  );

  const iconClass = isFamille
    ? 'bg-indigo-50 text-indigo-700'
    : isModele
      ? 'bg-amber-50 text-amber-700'
      : isArticle
        ? 'bg-emerald-50 text-emerald-700'
        : isMateriel
          ? 'bg-violet-50 text-violet-700'
          : isTechnique
            ? 'bg-orange-50 text-orange-700'
            : 'bg-sky-50 text-sky-700';

  function handleToggle(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    setOpen((value) => !value);
  }

  function handleOpenDetail() {
    if (href) {
      router.push(href);
    }
  }

  return (
    <div>
      <div
        onClick={handleOpenDetail}
        className={`group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm transition hover:bg-slate-50 ${
          href ? 'cursor-pointer' : ''
        }`}
        style={{ marginLeft: level * 24 }}
      >
        <button
          type="button"
          onClick={handleToggle}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition group-hover:bg-white"
        >
          {hasChildren ? (
            open ? (
              <ChevronDown size={18} />
            ) : (
              <ChevronRight size={18} />
            )
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          )}
        </button>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-2xl ${iconClass}`}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <span className="truncate text-sm font-black text-slate-950">
            {node.libelle ?? 'Sans libellé'}
          </span>
        </div>

        {hasChildren && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
            {node.children.length}
          </span>
        )}
      </div>

      {open && hasChildren && (
        <div className="mt-2 space-y-2">
          {node.children.map((child) => (
            <TreeNode key={child.key} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}