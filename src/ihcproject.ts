export class IHCBase {
  Name: string;
  Id: number;
  NodeTagName: string;

  // Filled in after the project has been read, not by the xml. Children is
  // what the tree draws under this node - rooms, products and function blocks
  // gather theirs when the project is laid out. filtered is the part of that
  // list a search has left, and null when no search is on.
  Children: IHCBase[];
  filtered: IHCBase[];

  constructor(node: Element) {
    this.Name = node.attributes["name"].value;
    var id: string = node.attributes["id"].value;
    this.Id = parseInt(id.substring(3), 16);
    this.NodeTagName = node.tagName;
  }

  protected FindAndAdd(
    node: Element,
    subnodename: string,
    addnode: (subnode: Element) => void
  ): void {
    var nodes = node.ownerDocument.evaluate(
      subnodename,
      node,
      null,
      XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      null
    );
    do {
      var subnode: Element = nodes.iterateNext() as Element;
      if (subnode == null) break;
      addnode(subnode);
    } while (true);
  }
}

export class IHCGroup extends IHCBase {
  Note: string;
  FunctionBlocks: IHCFunctionBlock[];
  Products: IHCProduct[];

  constructor(node: Element) {
    super(node);
    this.Note = node.getAttribute("note") || "";
    this.FunctionBlocks = new Array();
    this.Products = new Array();
    this.FindAndAdd(node, "functionblock", (subnode: Element) => {
      this.FunctionBlocks.push(new IHCFunctionBlock(subnode));
    });
    var products = node.ownerDocument.evaluate(
      "product_airlink",
      node,
      null,
      XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      null
    );
    do {
      var pnode: Element = products.iterateNext() as Element;
      if (pnode == null) break;
      var product: IHCWirelessProduct = new IHCWirelessProduct(pnode);
      this.Products.push(product);
    } while (true);
    products = node.ownerDocument.evaluate(
      "product_dataline",
      node,
      null,
      XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      null
    );
    do {
      var pnode: Element = products.iterateNext() as Element;
      if (pnode == null) break;
      var product: IHCDatalineProduct = new IHCDatalineProduct(pnode);
      this.Products.push(product);
    } while (true);
  }
}

export class IHCProduct extends IHCBase {
  Note: string;
  Position: string;
  // What kind of product this is, as the project describes it. The identifier
  // is the type itself - _0x2202 is a light outlet whatever anyone has renamed
  // it to - and IhcIcon is ihc's own icon number, which groups the types into
  // sensors, sounders, buttons, light outlets and sockets.
  ProductIdentifier: string;
  IhcIcon: string;
  CableNumber: string;
  Inputs: IHCInput[];
  Outputs: IHCOutput[];

  constructor(node: Element) {
    super(node);
    this.Inputs = new Array();
    this.Outputs = new Array();
    this.Note = node.getAttribute("note") || "";
    this.Position = node.getAttribute("position") || "";
    this.ProductIdentifier = node.getAttribute("product_identifier") || "";
    this.IhcIcon = node.getAttribute("icon") || "";
    this.CableNumber = node.getAttribute("cablenumber") || "";
    this.FindAndAdd(node, "airlink_input", (subnode: Element) => {
      this.Inputs.push(new IHCInput(subnode));
    });
    this.FindAndAdd(node, "airlink_dimmer_increase", (subnode: Element) => {
      this.Inputs.push(new IHCInput(subnode));
    });
    this.FindAndAdd(node, "airlink_dimmer_decrease", (subnode: Element) => {
      this.Inputs.push(new IHCInput(subnode));
    });
    this.FindAndAdd(node, "airlink_dimming", (subnode: Element) => {
      this.Inputs.push(new IHCInput(subnode));
    });
    this.FindAndAdd(node, "dataline_input", (subnode: Element) => {
      this.Inputs.push(new IHCInput(subnode));
    });

    this.FindAndAdd(node, "airlink_relay", (subnode: Element) => {
      this.Outputs.push(new IHCOutput(subnode));
    });
    this.FindAndAdd(node, "dataline_output", (subnode: Element) => {
      this.Outputs.push(new IHCOutput(subnode));
    });
    this.FindAndAdd(node, "light_indication", (subnode: Element) => {
      this.Outputs.push(new IHCOutput(subnode));
    });
  }
}

export class IHCWirelessProduct extends IHCProduct {
  constructor(node: Element) {
    super(node);
  }
}

export class IHCDatalineProduct extends IHCProduct {
  constructor(node: Element) {
    super(node);
  }
}

export class IHCFunctionBlock extends IHCBase {
  Note: string;
  Inputs: IHCInput[];
  Outputs: IHCOutput[];

  constructor(node: Element) {
    super(node);
    this.Note = node.getAttribute("note") || "";
    this.Inputs = new Array();
    var inputs = node.ownerDocument.evaluate(
      "inputs/*",
      node,
      null,
      XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      null
    );
    do {
      var inputnode: Element = inputs.iterateNext() as Element;
      if (inputnode == null) break;
      var input: IHCInput = new IHCInput(inputnode);
      this.Inputs.push(input);
    } while (true);

    this.Outputs = new Array();
    var outputs = node.ownerDocument.evaluate(
      "outputs/*",
      node,
      null,
      XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      null
    );
    do {
      var outputnode: Element = outputs.iterateNext() as Element;
      if (outputnode == null) break;
      var output: IHCOutput = new IHCOutput(outputnode);
      this.Outputs.push(output);
    } while (true);
  }
}

export class IHCResource extends IHCBase {
  // The product this resource sits on, filled in when the tree is built. A
  // resource on a function block belongs to no product and leaves this unset.
  Product: IHCProduct;

  // Where the resource sits in the tree, filled in at the same time: Parent is
  // the row right above it - the product or the function block - and Group is
  // the room. Product is left alone because the panel shows the product's own
  // fields; Parent is the one that is there whatever the resource hangs on.
  Parent: IHCBase;
  Group: IHCGroup;

  // What the resource is in Home Assistant, read from the mapping when the
  // tree is laid out. None of it comes from the project: connected says it is
  // an entity at all, platform which of the four it became, and the two names
  // are what the search looks through.
  connected: boolean;
  entity_id: string;
  platform: string;
  friendlyName: string;

  constructor(node: Element) {
    super(node);
  }

  get IsLightLevel() : boolean {
    return this.NodeTagName == "resource_light_level" || this.NodeTagName == "link_dimming";
  }
}

export class IHCInput extends IHCResource {
  constructor(node: Element) {
    super(node);
  }
}

export class IHCOutput extends IHCResource {
  constructor(node: Element) {
    super(node);
  }
}

export class IHCProject {
  protected xmldoc: XMLDocument;

  Groups: IHCGroup[];

  constructor(xmldoc: XMLDocument) {
    this.xmldoc = xmldoc;
    this.Groups = new Array();
    var gs = this.xmldoc.evaluate(
      "/utcs_project/groups/group",
      this.xmldoc,
      null,
      XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      null
    );
    do {
      var node: Element = gs.iterateNext() as Element;
      if (node == null) break;
      var group: IHCGroup = new IHCGroup(node);
      this.Groups.push(group);
    } while (true);
  }
}
