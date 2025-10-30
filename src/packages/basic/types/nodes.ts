import type { TreeNode } from '@ineka/engine'
import type { Transform } from '../utils/Transform'

export type TreeNodeWithTransform = TreeNode & { transform?: Transform }
