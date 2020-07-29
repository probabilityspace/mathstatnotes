var treeData =
  {
    "name": "Tap Here",
    "children": [
      { 
        "name": "1",
        "children": [
          { "name": "2" ,"children":[{"name": "3","children":[{"name":"4"}]},{"name": "4" ,"children":[{"name":"3"}]}]},
          { "name": "3" ,"children":[{"name": "2","children":[{"name":"4"}]},{"name": "4","children":[{"name":"2"}]}]},
		  {"name": "4" ,"children":[{"name": "2","children":[{"name":"3"}]},{"name": "3","children":[{"name":"2"}]}]}
        ],
      },
      { "name": "2",
	    "children": [
          { "name": "1" ,"children":[{"name": "3","children":[{"name":"4"}]},{"name": "4","children":[{"name":"3"}]}]},
          { "name": "3" ,"children":[{"name": "1","children":[{"name":"4"}]},{"name": "4","children":[{"name":"1"}]}]},
		  {"name": "4" ,"children":[{"name": "1","children":[{"name":"3"}]},{"name": "3","children":[{"name":"1"}]}]}
        ]
	  },
	  { "name": "3" 
	  ,
	    "children": [
          { "name": "1" ,"children":[{"name": "2","children":[{"name":"4"}]},{"name": "4","children":[{"name":"2"}]}]},
          { "name": "2" ,"children":[{"name": "1","children":[{"name":"4"}]},{"name": "4","children":[{"name":"1"}]}]},
		  {"name": "4" ,"children":[{"name": "1","children":[{"name":"2"}]},{"name": "2","children":[{"name":"1"}]}]}
        ]
	  },
	  { "name": "4" 
	  ,
	    "children": [
          { "name": "1" ,"children":[{"name": "2","children":[{"name":"3"}]},{"name": "3","children":[{"name":"2"}]}]},
          { "name": "2" ,"children":[{"name": "1","children":[{"name":"3"}]},{"name": "3","children":[{"name":"1"}]}]},
		  {"name": "3" ,"children":[{"name": "1","children":[{"name":"2"}]},{"name": "2","children":[{"name":"1"}]}]}
        ]
	  }
    ]
  };

// Set the dimensions and margins of the diagram
var margin = {top: 40, right: 0, bottom: 0, left: 0},
    width = 600 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate("
          + margin.left + "," + margin.top + ")");

var i = 0,
    duration = 750,
    root;

// declares a tree layout and assigns the size
var treemap = d3.tree().size([height, width]);

// Assigns parent, children, height, depth
root = d3.hierarchy(treeData, function(d) { return d.children; });
root.x0 = 0;
root.y0 = width/2;

// Collapse after the second level
//root.children.forEach(collapse);
collapse(root);

update(root);

// Collapse the node and all it's children
function collapse(d) {
  if(d.children) {
    d._children = d.children
    d._children.forEach(collapse)
    d.children = null
  }
}

function update(source) {

  // Assigns the x and y position for the nodes
  var treeData = treemap(root);

  // Compute the new tree layout.
  var nodes = treeData.descendants(),
      links = treeData.descendants().slice(1);

  // Normalize for fixed-depth.
  nodes.forEach(function(d){ d.y = d.depth * 70});

  // ****************** Nodes section ***************************

  // Update the nodes...
  var node = svg.selectAll('g.node')
      .data(nodes, function(d) {return d.id || (d.id = ++i); });

  // Enter any new modes at the parent's previous position.
  var nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr("transform", function(d) {
        return "translate(" + source.x0 + "," + source.y0 + ")";
    })
    .on('click', click);

  // Add Circle for the nodes
  nodeEnter.append('circle')
      .attr('class', 'node')
      .attr('r', 1e-6)
      .style("fill", function(d) {
          return d._children ? "lightsteelblue" : "#fff";
      });

  // Add labels for the nodes
  nodeEnter.append('text')
      .attr("dy", ".35em")
      .attr("x", function(d) {
          return d.children || d._children ? 0.5 : 1.5;
      })
      .attr("text-anchor", function(d) {
          return d.children || d._children ? "end" : "start";
      })
      .text(function(d) { return d.data.name; });

  // UPDATE
  var nodeUpdate = nodeEnter.merge(node);

  // Transition to the proper position for the node
  nodeUpdate.transition()
    .duration(duration)
    .attr("transform", function(d) { 
        return "translate(" + d.x + "," + d.y + ")";
     });

  // Update the node attributes and style
  nodeUpdate.select('circle.node')
    .attr('r', 10)
    .style("fill", function(d) {
        return d._children ? "lightsteelblue" : "#fff";
    })
    .attr('cursor', 'pointer');


  // Remove any exiting nodes
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) {
          return "translate(" + source.x + "," + source.y + ")";
      })
      .remove();

  // On exit reduce the node circles size to 0
  nodeExit.select('circle')
    .attr('r', 1e-6);

  // On exit reduce the opacity of text labels
  nodeExit.select('text')
    .style('fill-opacity', 1e-6);

  // ****************** links section ***************************

  // Update the links...
  var link = svg.selectAll('path.link')
      .data(links, function(d) { return d.id; });

  // Enter any new links at the parent's previous position.
  var linkEnter = link.enter().insert('path', "g")
      .attr("class", "link")
      .attr('d', function(d){
        var o = {x: source.x0, y: source.y0}
        return diagonal(o, o)
      });

  // UPDATE
  var linkUpdate = linkEnter.merge(link);

  // Transition back to the parent element position
  linkUpdate.transition()
      .duration(duration)
      .attr('d', function(d){ return diagonal(d, d.parent) });

  // Remove any exiting links
  var linkExit = link.exit().transition()
      .duration(duration)
      .attr('d', function(d) {
        var o = {y: source.x, y: source.y}
        return diagonal(o, o)
      })
      .remove();

  // Store the old positions for transition.
  nodes.forEach(function(d){
    d.x0 = d.x;
    d.y0 = d.y;
  });

  // Creates a curved (diagonal) path from parent to the child nodes
  function diagonal(s, d) {

    path = `M ${s.x} ${s.y}
            C ${(s.x + d.x) / 2} ${s.y},
              ${(s.x + d.x) / 2} ${d.y},
              ${d.x} ${d.y}`

    return path
  }

  // Toggle children on click.
  function click(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
    update(d);
  }
}
