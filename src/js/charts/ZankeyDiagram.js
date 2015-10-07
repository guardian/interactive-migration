import d3 from 'd3'
import { palette1 } from '../lib/colors'
import shortnames from '../../assets/data/shortnames.json!json'

export default function ZankeyDiagram(data,options) {

	//console.log("ZankeyDiagram")
	////console.log(data)

	var CURRENT_STATUS=options.status || 0,
		statueses=data.flows.length;

	

	

	var WIDTH=options.width,
		HEIGHT=options.height,
		margins=options.margins;

	var bar_width=15,
		_spacing=options.spacing || {
			l:0,
			r:0
		},
		_spacing_within={
			l:0,
			r:0
		};
	var from_y=[0,0],
		to_y=[0,0];

	var extents;
	computeExtents();
	extents.all_flows=data.data.filter(function(d){return d.flows[CURRENT_STATUS]>0}).length;




	var ky = ((HEIGHT-(margins.top+margins.bottom)-(extents.length*Math.max(_spacing.l,_spacing.r))-(extents.all_flows*_spacing_within.r))) / extents.y[1] ;
	
	var canvas_height=HEIGHT-(margins.top+margins.bottom),
		spacing_height=data.flows[CURRENT_STATUS].from.countries.length * _spacing.l,
		h=canvas_height-spacing_height;

	ky = h / extents.y[1];//data.flows[CURRENT_STATUS].from.total;


	var __spacing_height=[
			data.flows[0].from.countries.length * _spacing.l,
			data.flows[1].from.countries.length * _spacing.l
		],
		__h=[
			canvas_height-__spacing_height[0],
			canvas_height-__spacing_height[1]
		];

	ky=Math.min(__h[0] / extents.y[1],__h[1] / extents.y[1])


	/*
	if(extents.__length[CURRENT_STATUS]<extents.length) {
		if(_spacing.l) {
			_spacing.l *= (extents.length / extents.__length[CURRENT_STATUS])
			
		}
	}
	*/
	var auto=options.auto;
	if(auto) {


		let flows_height=data.flows[CURRENT_STATUS].from.total*ky,
			canvas_height=HEIGHT-(margins.top+margins.bottom);
		if( flows_height < canvas_height) {
			//console.log(CURRENT_STATUS,canvas_height,flows_height,_spacing.l)
			_spacing.l = (canvas_height - flows_height) / extents.__length[CURRENT_STATUS];
			//console.log(canvas_height/flows_height,_spacing.l)
		}

	}

	extents.diffs_from=data.flows.map(function(d,i){
								////console.log(extents.y[1],i,d.from.total,HEIGHT-(margins.top+margins.bottom),(d.from.total*ky + extents.diffs[i]*spacing))
								//var space=(extents.y[1] - d.from.total)*ky + (extents.length - d.from.countries.length)*_spacing.l
								////console.log("--->",space)
								

								var space=canvas_height - (data.flows[i].from.total*ky + extents.__length_from[i]*_spacing.l);
								
								/*//console.log(
									i,
									HEIGHT-(margins.top+margins.bottom),
									data.flows[i].from.total*ky,
									extents.__length_from[i],
									extents.__length_from[i]*_spacing.l
								)*/

								return space/2;
							});

	extents.diffs_to=data.flows.map(function(d,i){

		var space=canvas_height - (data.flows[i].to.total*ky + extents.__length_to[i]*_spacing.r);	
		console.log(
			i,
			HEIGHT-(margins.top+margins.bottom),
			"ky:"+ky,
			"total:"+data.flows[i].to.total,
			"total*ky="+data.flows[i].to.total*ky,
			`extents.__length_to[${i}]=`,extents.__length_to[i],
			extents.__length_to[i],"*",_spacing.r,
			extents.__length_to[i]*_spacing.r
		)
		return space/2;
	})

	//console.log(extents)
	computeNodes();

	//console.log(data)

	
	

	//console.log(extents)

	//var yscale=d3.scale.linear().domain(extents.y).range([0,HEIGHT-(margins.top+margins.bottom)])

	////console.log(data.countries)
	//return;

	var color_scale = d3.scale.ordinal()
			    .domain(data.countries.europe)
			    .range(palette1)
			    //.range(["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#f7f7f7","#d1e5f0","#92c5de","#4393c3","#2166ac","#053061"]); 

	var svg=d3.select(options.container)
				.append("svg")
				.attr("class","zankey-diagram")
				.on("mouseleave",function(d){
					showFlows();
					if(options.mouseleaveCallback) {
						options.mouseleaveCallback();
					}
					setHighlightMode(false)
				})

	var defs=svg.append("defs");

	
	data.countries.europe.forEach(function(country){
        options.areas.forEach(function(area){
            var gradient=defs.append("linearGradient")
                    .attr({
                        id:"grad_"+area+"2"+country.replace(/\s/gi,"").toLowerCase(),
                        x1:"0%",
                        y1:"0%",
                        x2:"100%",
                        y2:"0%"
                    });
            gradient.append("stop")
                        .attr({
                            offset:"0%",
                            "class":area

                        })
            gradient.append("stop")
                        .attr({
                            offset:"100%",
                            "class":country.replace(/\s/gi,"").toLowerCase(),
                            //"stop-color":color_scale(country)
                        })
        })
    });
    options.areas.forEach(function(area){
        var gradient=defs.append("linearGradient")
                .attr({
                    id:"grad_"+area+"2gray",
                    x1:"0%",
                    y1:"0%",
                    x2:"100%",
                    y2:"0%"
                });
        gradient.append("stop")
                    .attr({
                        offset:"0%",
                        "class":area

                    })
        gradient.append("stop")
                    .attr({
                        offset:"100%",
                        "class":"gray"
                    })
    })

	var flows_g=svg.append("g")
					.attr("class","flows")
					.attr("transform","translate("+margins.left+","+margins.top+")")

	var from_g=svg.append("g")
					.attr("class","from")
					.attr("transform","translate("+margins.left+","+margins.top+")")

	var to_g=svg.append("g")
					.attr("class","to")
					.attr("transform","translate("+(WIDTH-margins.right)+","+margins.top+")")

	if(options.legend) {
		var legend=svg.append("g")
				.attr("class","legend")
				.attr("transform","translate("+margins.left+","+margins.top+")")
		addLegend();	
	}
	

	update();
	showFlows();

	function computeNodes() {

		
		//console.log("KY",ky)

		//data.flows.forEach(function(flowset){

		var flowset=data.flows[CURRENT_STATUS]
		
			from_y=[extents.diffs_from[0],extents.diffs_from[1]];
			if(auto || options.topAligned) {
				from_y=[0,0]
			}
			//from_y = [(extents.diffs[0]*(_spacing.l))/2+extents.diffs_from[0],(extents.diffs[1]*(_spacing.l))/2+extents.diffs_from[1]];
			
			flowset.from.countries.forEach(function(country,i){

				////console.log("!!!",country)

				var rel_y=[0,0];
				country.values.flows.forEach(function(flow){
					if(!flow.from_y) {
						flow.from_y=[0,0];
						flow.rel_from_y=[0,0];
					}
					flow.from_y[0]=from_y[0];
					flow.rel_from_y[0]=rel_y[0];
					
					flow.from_y[1]=from_y[1];
					flow.rel_from_y[1]=rel_y[1];

					from_y[0]+=flow.flows[0]*ky ;
					rel_y[0]+=flow.flows[0]*ky ;

					from_y[1]+=flow.flows[1]*ky ;
					rel_y[1]+=flow.flows[1]*ky ;

					from_y[0]+= _spacing_within.l;
					from_y[1]+= _spacing_within.l; 
				})
				////console.log("1",from_y[0],spacing)
				////console.log(spacing)
				from_y[0]+= _spacing.l;
				from_y[1]+= _spacing.l; 
				////console.log("2",from_y[0],spacing)
			});

			let from_height=[
					data.flows[0].from.total*ky + extents.__length_from[0]*_spacing.l,
					data.flows[1].from.total*ky + extents.__length_from[1]*_spacing.l
				],
				to_height=[
					data.flows[0].to.total*ky + extents.__length_to[0]*_spacing.r,
					data.flows[1].to.total*ky + extents.__length_to[1]*_spacing.r
				]

			


			//var to_y=[(extents.diffs[0]*(_spacing.l))/2+extents.diffs_from[0],(extents.diffs[1]*(_spacing.l))/2+extents.diffs_from[1]];
			
			//to_y=[(from_height[0]-to_height[0])/2,(from_height[1]-to_height[1])/2]

			to_y=[extents.diffs_to[0],extents.diffs_to[1]];

			if(options.topAligned && !auto) {
				to_y=[0,0]
			}

			flowset.to.countries.forEach(function(country,i){
				var rel_y=[0,0];
				country.values.flows.forEach(function(flow){
					if(!flow.to_y) {
						flow.to_y=[0,0];
						flow.rel_to_y=[0,0];
					}

					flow.to_y[0]=to_y[0];
					flow.rel_to_y[0]=rel_y[0];
					
					flow.to_y[1]=to_y[1];
					flow.rel_to_y[1]=rel_y[1];

					to_y[0]+=flow.flows[0]*ky;
					rel_y[0]+=flow.flows[0]*ky;

					to_y[1]+=flow.flows[1]*ky;
					rel_y[1]+=flow.flows[1]*ky;

					to_y[0]+= _spacing_within.r;
					to_y[1]+= _spacing_within.r;
					////console.log("2",to_y[0], _spacing.r)
				})
				////console.log("1. TO Y",to_y[1])
				to_y[0]+= _spacing.r;
				to_y[1]+= _spacing.r;

				////console.log("2. TO Y",to_y[1])

			})

		//})

		

		

	}
	function computeExtents() {
		
		console.log("EXTENTS",d3.max(data.flows,function(d){
			return d.from.total;
		}));

		extents= {
			y:[0,options.max || d3.max(data.flows,function(d){
				return d.from.total;
			})],
			length:d3.max(data.flows,function(d){
				return d.from.countries.length;
			}),
			__length:[
				data.data.filter(function(d){
					return d.flows[0]>0
				}).length,
				data.data.filter(function(d){
					return d.flows[1]>0
				}).length
			],
			__length_from:[
				data.flows[0].from.countries.length,
				data.flows[1].from.countries.length
			],
			__length_to:[
				data.flows[0].to.countries.length,
				data.flows[1].to.countries.length
			],
			diffs:data.flows.map(function(d){
				return d.from.countries.length - d.to.countries.length;
			})
		}


		
	}

	this.changeStatus=function(status) {
		CURRENT_STATUS=status;
		computeNodes();
		update();
	}

	function update() {

		// FROM

		var from_countries=from_g.selectAll("g.country")
				.data(data.flows[CURRENT_STATUS].from.countries,function(d){
					return d.key;
				});

		var new_countries=from_countries
							.enter()
							.append("g")
								.attr("class","country")
								.attr("rel",function(d){
									return d.key;
								})
								.style("opacity",0)
								.on("mouseenter",function(d){
									showFlows();
									setHighlightMode(true);
									showFlowsFrom(d.key);

									if(options.mouseoverCallback) {
										options.mouseoverCallback({
											d:d,
											from:1
										});
									}
								})
		if(options.show_country_names[0]) {
			new_countries.append("text")
						.attr("x",-2)
						.attr("dy","0.2em")
						.text(function(d){
							return shortnames[d.key] || d.key;
						})
			new_countries.append("text")
						.attr("x",-2)
						.attr("dy","16px")
						.text(function(d){
							return options.number_format(d.values.sizes[CURRENT_STATUS]);
						})
		}
		if(options.show_country_numbers[0]) {
			new_countries.append("text")
						.attr("x",-2)
						.attr("dy","16px")
						.text(function(d){
							return options.number_format(d.values.sizes[CURRENT_STATUS]);
						})
		}

		new_countries.append("rect")
					.attr("x",0)
					.attr("y",0)
					.attr("width",bar_width)
					.attr("class",function(d) {

						if(!options.country_colors[0]) {
							return "country gray";
						}

						var area=data.countries.world.find(function(c){
							return c.c === d.key;
						})
						if(!area.a) {
							//return "country gray";
						}
						return "country "+(area.a || d.key.replace(/\s/gi,"").toLowerCase());
					})
		new_countries.append("rect")
					.attr("class","bg")
					.attr("x",-margins.left)
					.attr("y",-_spacing.l/2)
					.attr("width",(WIDTH-(margins.right+margins.left))/2+margins.left);//margins.left*2)

		from_countries.exit().remove();

		from_g.selectAll("g.country")
								//.transition()
								//.duration(1000)
								.attr("transform",function(d,i){
									var y=(d.values.flows[0].from_y[CURRENT_STATUS]);
									return "translate(0,"+(y)+")";
								})
								.style("opacity",1)
		
		from_g.selectAll("g.country rect.country")
					.attr("height",function(d){
						return d3.max([0.5,d.values.sizes[CURRENT_STATUS] * ky]);
					})
		from_g.selectAll("g.country rect.bg")
					.attr("height",function(d){
						return d3.max([0.5,d.values.sizes[CURRENT_STATUS] * ky])+(_spacing.l);
					})

		from_g.selectAll("g.country text")
			.classed("hidden",function(d,i){
				
				return i>2 && (d.values.sizes[CURRENT_STATUS]*ky)<((10+(_spacing.l)*2)+options.show_country_numbers[0]?20:0);
			})
			.attr("y",function(d){
				return (d.values.sizes[CURRENT_STATUS]*ky)/2;
			})
		

		// TO
		var to_countries=to_g.selectAll("g.country")
				.data(data.flows[CURRENT_STATUS].to.countries,function(d){
					return d.key;
				});

		new_countries=to_countries
							.enter()
							.append("g")
								.attr("class","country")
								.attr("rel",function(d){
									return d.key;
								})
								.style("opacity",0)
								.on("mouseenter",function(d){
									setHighlightMode(true);
									showFlowsTo(d.key);

									if(options.mouseoverCallback) {
										options.mouseoverCallback({
											d:d,
											from:0
										});
									}
								})


		if(options.show_country_names[1]) {
			new_countries.append("text")
						.attr("x",bar_width+2)
						.attr("dy","0.2em")
						.attr("y",function(d){
							return (d.values.sizes[CURRENT_STATUS]*ky)/2;
						})
						.text(function(d){
							return shortnames[d.key] || d.key;
						})
						
		}
		if(options.show_country_numbers[1]) {
			new_countries.append("text")
						.attr("x",bar_width+2)
						.attr("dy",options.show_country_names[1]?"16px":"0.2em")
						.attr("y",function(d){
							return (d.values.sizes[CURRENT_STATUS]*ky)/2;
						})
						.text(function(d){
							return options.number_format(d.values.sizes[CURRENT_STATUS]);
						})
						
		}

		new_countries.append("rect")
					.attr("x",0)
					.attr("y",0)
					.attr("width",bar_width)
					.attr("class",function(d) {
						if(!options.country_colors[1]) {
							return "country gray";
						}
						return "country "+d.key.replace(/\s/gi,"").toLowerCase();
					})

		
		new_countries.append("rect")
					.attr("class","bg")
					.attr("x",-(WIDTH-(margins.right+margins.left))/2)
					.attr("y",-(_spacing.r)/2)
					.attr("width",(WIDTH-(margins.right+margins.left))/2+margins.right)//margins.right*2)

		to_countries.exit().remove();			

		to_g.selectAll("g.country")
								//.transition()
								//.duration(1000)
								.attr("transform",function(d,i){
									var y=(d.values.flows[0].to_y[CURRENT_STATUS]);
									return "translate(0,"+(y)+")";
								})
								.style("opacity",1)
								/*.selectAll("g.from-country")
									.attr("transform",function(d){
										var y=(d.rel_to_y[CURRENT_STATUS]);
										return "translate(0,"+y+")";
									})
									.select("rect")
										.attr("height",function(d){
											return (d.flows[CURRENT_STATUS]*ky);
										})*/
		to_g.selectAll("g.country rect.country")
					.attr("height",function(d){

						////console.log("------------>",d)

						return d3.max([0.5,d.values.sizes[CURRENT_STATUS] * ky + (_spacing_within.r*extents.diffs[CURRENT_STATUS])]);
					})

		to_g.selectAll("g.country rect.bg")
					.attr("height",function(d){
						return d3.max([1,d.values.sizes[CURRENT_STATUS] * ky + (_spacing_within.r*extents.diffs[CURRENT_STATUS])]);
					})

		to_g.selectAll("g.country text")
			.classed("hidden",function(d,i){
				
				return i>2 && (d.values.sizes[CURRENT_STATUS]*ky)<((10+_spacing.r*2)+options.show_country_numbers[1]?20:0);
			})
			.attr("y",function(d){
				return (d.values.sizes[CURRENT_STATUS]*ky)/2;
			})

								
		if(options.legend) {
			updateLegend();
		}
		updateFlows();


	}

	function drawFlow(flow) {
		var curvature = .5;

		////console.log("--->",flow)

		var x0=0+bar_width+2,
			y0=(flow.from_y[CURRENT_STATUS]) + (flow.flows[CURRENT_STATUS]*ky)/2,
			x1=WIDTH-(margins.left+margins.right)-2,
			y1=(flow.to_y[CURRENT_STATUS]) + (flow.flows[CURRENT_STATUS]*ky)/2 + 0.0001;

		var xi = d3.interpolateNumber(x0, x1),
			x2 = xi(curvature),
          	x3 = xi(1 - curvature)

        //y1 = (flow.to_y[CURRENT_STATUS]*ky)<0.5?y1-0.5:y1

        return 	 "M" + x0 + "," + y0
	           + "C" + x2 + "," + y0
	           + " " + x3 + "," + y1
	           + " " + x1 + "," + y1;

		return "M"+x0+","+y0+"L"+x1+","+y1+"";
	} 

	function updateFlows() {
		
		var flows=flows_g
					.selectAll("g.flow")
						.data(data.data.filter(function(d){return d.flows[CURRENT_STATUS]>0}),function(d){
							////console.log("!!!!",d)
							return d.from+"2"+d.to;
						});

		var new_flows=flows
							.enter()
							.append("g")
								.attr("class","flow")
								.attr("rel",function(d,i){
									return i+": "+d.from+"2"+d.to;
								})
		flows.exit().remove();
		
		
		new_flows.append("path")
					.style("stroke",function(d){
						//return;
						var area=data.countries.world.find(function(c){
							return c.c === d.from;
						})

						if(!options.country_colors[1]) {
							return "url(#grad_"+area.a+"2gray";
						}

						return "url(#grad_"+(area.a || d.from.replace(/\s/gi,"").toLowerCase())+"2"+d.to.replace(/\s/gi,"").toLowerCase()+")"
						//return color_scale(d.to)
					})
		if(options.inner_labels[0]) {
			new_flows.append("text")
				.attr("class","from")
				.attr("x",bar_width+5)
				.attr("y",function(flow){
					return (flow.from_y[CURRENT_STATUS]) + (flow.flows[CURRENT_STATUS]*ky)/2
				})
				.text(function(flow){
					return options.number_format(flow.flows[CURRENT_STATUS]);
				})
		}
		
		if(options.inner_labels[1]) {
			new_flows.append("text")
					.attr("class","to")
					.attr("x",WIDTH-(margins.left+margins.right)-2)
					.attr("y",function(flow){
						return (flow.to_y[CURRENT_STATUS]) + (flow.flows[CURRENT_STATUS]*ky)/2
					})
					.text(function(flow){
						return options.number_format(flow.flows[CURRENT_STATUS]);
					})
		}
		

		flows_g.selectAll("g.flow")
					.select("path")
						/*.classed("opaque",function(d){
							return d.flows[CURRENT_STATUS]*ky<1
						})*/
						//.transition()
						//.duration(1000)
						.attr("d",drawFlow)
						.style("stroke-width",function(d){
							//return d.flows[CURRENT_STATUS]*ky;
							return d3.max([(d.flows[CURRENT_STATUS]*ky),0.5]);
						})
						

	}
	function setHighlightMode(mode){
		svg.classed("highlight",mode)
	}
	this.showFlows=function(country,from) {
		if(!country) {
			setHighlightMode(false);
			showFlows();
			return;
		}
		setHighlightMode(true);
		if(from) {
			//console.log("!!! showing flows from",country.key)
			showFlowsFrom(country.key);
			
		} else {
			//console.log("!!! showing flows to",country.key)
			showFlowsTo(country.key);
		}

	}
	function showFlows() {
		svg.selectAll(".highlight").classed("highlight",false);
		
		if(options.highlight) {
			if(options.highlight.from) {
				showFlowsFrom(options.highlight.from)
			}
			if(options.highlight.to) {
				showFlowsTo(options.highlight.to)
			}
			return;
		}

		svg.selectAll(".hidden:not(text)").classed("hidden",true);
	}
	function showFlowsFrom(src) {

		from_g.selectAll("g.country")
			.classed("highlight",function(d){
				return d.key === src;
			})

		flows_g
			.selectAll("g.flow")
			//.classed("hidden",true)
			.classed("hidden",function(d){
				return d.from !== src;
			})
			.classed("from",false)
			.classed("to",false)
			.filter(function(d){
				return d.from === src;
			})
			.classed("highlight",true)
			.classed("from",true)
			.moveToFront()
	}
	function showFlowsTo(dst) {

		to_g.selectAll("g.country")
			.classed("highlight",function(d){
				return d.key === dst;
			})

		flows_g
			.selectAll("g.flow")
			.classed("from",false)
			.classed("to",false)
			.classed("hidden",function(d){
				return d.to !== dst;
			})
			.filter(function(d){
				return d.to === dst;
			})
			.classed("highlight",true)
			.classed("to",true)
			.moveToFront()
	}

	function addLegend() {
		
		defs.append("marker")
				.attr({
					id:"markerArrow",
					markerWidth:13,
					markerHeight:13,
					refX:8,
					refY:6,
					orient:"auto"
				})
				.append("path")
					.attr("d","M2,2 L2,11 L10,6 L2,2")
					.style({
						fill:"#767676",
						stroke:"none"
					})

		legend.append("text")
				.attr("class","from")
				.attr("x",bar_width)
				.attr("y",0)
				.attr("dy","4px")
				.text("ORIGINS");

		legend.append("text")
				.attr("class","to")
				.attr("x",WIDTH-margins.right-margins.left)
				.attr("y",0)
				.attr("dy","4px")
				.text("DESTINATIONS");

		legend.append("line")
				.attr("x1",bar_width+5)
				.attr("y1",0)
				.attr("x2",WIDTH-margins.right-margins.left-5)
				.attr("y2",0)
				.style("marker-end","url(#markerArrow)")
	}
	function updateLegend() {
		legend.attr("transform","translate("+margins.left+","+(extents.diffs_from[CURRENT_STATUS]+4)+")")
	}

	this.update=function(){

	}

	this.resize=function(){
		
	}
}

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
  this.parentNode.appendChild(this);
  });
};