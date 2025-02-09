import { Item } from "@/types/outputdata";

type TreeNode = {
    item: Item;
    count: number;
    children: TreeNode[];
};

export type { TreeNode };