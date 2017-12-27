/* exported wbSankeyDiagram */
/**
 * Classic sankey diagram.
 * @return {Object} A reusable, updatable chart object.
 */
function wbSankeyDiagram() {
    'use strict';

    let width = 500;
    let height = 500;
    let fill = 'black';
    let colors = d3.scaleOrdinal(d3.schemeCategory20c);

    let chart = function(selection) {
        selection.each(function(data, i, nodes) {
            let s = d3.select(nodes[i]);

            let formatNumber = d3.format(',.0f');
            let format = function(d) {
                return formatNumber(d) + ' TWh';
            };

            let sankey = d3.sankey()
                .nodeWidth(15)
                .nodePadding(10)
                .size([width, height]);

            let path = sankey.link();
            sankey
                .nodes(data.nodes)
                .links(data.links)
                .layout(32);

            let link = s.selectAll('.sankey-link')
                .data(data.links)
                .enter().append('path')
                .attr('class', 'sankey-link')
                .style('fill', 'none')
                .style('stroke', fill)
                .style('stroke-opacity', .2)
                .attr('d', path)
                .style('stroke-width', function(d) {
                    return Math.max(1, d.dy);
                })
                .sort(function(a, b) {
                    return b.dy - a.dy;
                });

            link.append('title')
                .text(function(d) {
                    return d.source.name + ' → ' +
                    d.target.name + '\n' + format(d.value);
                });

            let dragmove = function(d, i, nodes) {
                d3.select(nodes[i])
                    .attr('transform', 'translate(' + d.x
                    + ',' + (d.y = Math.max(0,
                        Math.min(height - d.dy, d3.event.y))) + ')');
                sankey.relayout();
                link.attr('d', path);
            };

            let node = s.selectAll('.sankey-node')
                .data(data.nodes)
                .enter().append('g')
                .attr('class', 'sankey-node')
                .attr('transform', function(d) {
                    return 'translate(' + d.x + ',' + d.y + ')';
                })
                .call(d3.drag()
                    .subject(function(d) {
                        return d;
                    })
                    .on('start', function(d, i, nodes) {
                        nodes[i].parentNode.appendChild(nodes[i]);
                    })
                    .on('drag', dragmove));

            node.append('rect')
                .style('cursor', 'move')
                .style('shape-rendering', 'crispEdges')
                .attr('height', function(d) {
                    return d.dy;
                })
                .attr('width', sankey.nodeWidth())
                .style('fill', function(d) {
                    return d.color = colors(d.name.replace(/ .*/, ''));
                })
                .style('stroke', function(d) {
                    return fill;
                })
                .append('title')
                .text(function(d) {
                    return d.name + '\n' + format(d.value);
                });

            node.append('text')
                .attr('x', -6)
                .attr('y', function(d) {
                    return d.dy / 2;
                })
                .attr('dy', '.35em')
                .attr('text-anchor', 'end')
                .attr('fill', fill)
                .attr('transform', null)
                .text(function(d) {
                    return d.name;
                })
                .filter(function(d) {
                    return d.x < width / 2;
                })
                .attr('x', 6 + sankey.nodeWidth())
                .attr('text-anchor', 'start');
        });
    };

    chart.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return chart;
    };

    chart.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return chart;
    };

    chart.fill = function(value) {
        if (!arguments.length) return fill;
        fill = value;
        return chart;
    };

    chart.colors = function(value) {
        if (!arguments.length) return colors;
        colors = value;
        return chart;
    };

    return chart;
}
