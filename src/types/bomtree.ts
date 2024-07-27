import { Item } from "./outputdata";

type TreeNode = {
    item: Item;
    count: number;
    children: TreeNode[];
};

export type { TreeNode };