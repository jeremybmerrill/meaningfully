import { TextNode, BaseNode, TransformComponent } from "llamaindex";
import { encodingForModel } from "js-tiktoken";

interface SploderConfig {
  maxStringTokenCount: number;
}

export class Sploder extends TransformComponent {
  private maxTokenCount: number;
  private tokenizer: any; // js-tiktoken encoder

  // TODO: this is a hack to get the tokenizer for the embedding model
  // TODO: this should be a singleton
  constructor(config: SploderConfig) {
    super(async (nodes: BaseNode[]) => nodes); // no-op, to be replaced later
    this.maxTokenCount = config.maxStringTokenCount;
    this.tokenizer = encodingForModel("text-embedding-3-small");
  }

  private getTokenCount(text: string): number {
    return this.tokenizer.encode(text).length;
  }

  async transform(nodes: TextNode[]): Promise<TextNode[]> {
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