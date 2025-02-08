import { TextNode } from "llamaindex";
import { encodingForModel } from "js-tiktoken";

interface SploderConfig {
  maxStringTokenCount: number;
}

export class Sploder {
  private maxTokenCount: number;
  private tokenizer: any; // js-tiktoken encoder

  constructor(config: SploderConfig) {
    this.maxTokenCount = config.maxStringTokenCount;
    this.tokenizer = encodingForModel("text-embedding-3-small");
  }

  private getTokenCount(text: string): number {
    return this.tokenizer.encode(text).length;
  }

  transform(nodes: TextNode[]): TextNode[] {
    const newNodes: TextNode[] = [];

    nodes.forEach((node, index) => {
      // Keep original node
      newNodes.push(node);

      // Skip if text is too long
      if (this.getTokenCount(node.text) > this.maxTokenCount) {
        return;
      }

      const prevNode = index > 0 ? nodes[index - 1] : null;
      const nextNode = index < nodes.length - 1 ? nodes[index + 1] : null;

      // Create node with current + next if available
      if (nextNode) {
        newNodes.push(
          new TextNode({
            text: node.text + " " + nextNode.text,
            metadata: { ...node.metadata, isExpanded: true }
          })
        );
      }

      // Create node with prev + current + next if both available
      if (prevNode && nextNode) {
        newNodes.push(
          new TextNode({
            text: prevNode.text + " " + node.text + " " + nextNode.text,
            metadata: { ...node.metadata, isExpanded: true }
          })
        );
      }
    });

    return newNodes;
  }
} 