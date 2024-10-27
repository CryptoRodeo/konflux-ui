import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import update from 'lodash/update';
import { NODE_ICON_WIDTH, NODE_PADDING } from '../const';
import { PipelineMixedNodeModel, WorkflowResources } from '../types';

const STATUS_WIDTH = 16;

const DEFAULT_CHAR_WIDTH = 8;

export const getMaxName = (resources: WorkflowResources): string | null => {
  if (!resources || resources.length < 1) {
    return null;
  }
  return resources.sort((a, b) => b.metadata.name.length - a.metadata.name.length)[0].metadata.name;
};

export const getTextWidth = (text: string, font: string = '0.875rem RedHatText'): number => {
  if (!text || text.length === 0) {
    return 0;
  }
  const canvas = document.createElement('canvas');
  const context = canvas.getContext?.('2d');
  if (!context) {
    return text.length * DEFAULT_CHAR_WIDTH;
  }
  context.font = font;
  const { width } = context.measureText(text);

  return width || text.length * DEFAULT_CHAR_WIDTH;
};

export const getLabelWidth = (label: string): number =>
  getTextWidth(label) + NODE_PADDING * 2 + NODE_ICON_WIDTH;

export const getNodeWidth = (label: string, status?: string, numChildren = 0): number =>
  getLabelWidth(label) +
  (status ? STATUS_WIDTH + NODE_PADDING : 0) +
  (numChildren ? getTextWidth(`${numChildren}`) + NODE_PADDING * 3 : 0);

export const getLatestResource = (resources = []) =>
  resources
    ?.sort?.(
      (a, b) =>
        new Date(b.metadata.creationTimestamp as string).getTime() -
        new Date(a.metadata.creationTimestamp as string).getTime(),
    )
    .slice(0, 1)
    .shift();

export const addPrefixFromResourceName = (prefix: string, resourceName: string) =>
  `${prefix}#${resourceName}`;

export const removePrefixFromResourceName = (name: string) =>
  name.includes('#') ? name.split('#').pop() : name;

export const appendPrefixToResources = (
  resources: WorkflowResources,
  nameToAppend: string,
  additionalPath?: string,
): WorkflowResources =>
  resources.map((e) => {
    let obj = update(cloneDeep(e as object), 'metadata.name', (name) =>
      addPrefixFromResourceName(nameToAppend, name as string),
    );
    if (additionalPath && get(obj, additionalPath, false)) {
      obj = update(obj as object, additionalPath, (name) =>
        addPrefixFromResourceName(nameToAppend, name as string),
      );
    }
    return obj;
  });

export const updateParallelNodeWidths = (nodes: PipelineMixedNodeModel[]) => {
  if (nodes?.length > 1) {
    const maxWidth = nodes.reduce((max, node) => Math.max(max, node.width), 0);
    nodes.forEach((n) => (n.width = maxWidth));
  }
};
