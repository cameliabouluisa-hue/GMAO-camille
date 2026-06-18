import type {
  FamilleApi,
  FamilleFlatRow,
  FamilleNode,
} from '@/features/familles/types/famille';

export function buildFamilleTree(familles: FamilleApi[]): FamilleNode[] {
  const map = new Map<number, FamilleNode>();

  for (const famille of familles) {
    map.set(famille.idFamille, {
      ...famille,
      children: [],
    });
  }

  const roots: FamilleNode[] = [];

  for (const famille of familles) {
    const node = map.get(famille.idFamille)!;

    if (famille.parent_id && map.has(famille.parent_id)) {
      map.get(famille.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export function flattenTree(
  nodes: FamilleNode[],
  level = 0,
): FamilleFlatRow[] {
  const result: FamilleFlatRow[] = [];

  for (const node of nodes) {
    result.push({ node, level });

    if (node.children.length > 0) {
      result.push(...flattenTree(node.children, level + 1));
    }
  }

  return result;
}