import d3 from 'd3'
import { palette1 } from '../lib/colors'

export default function ZankeyDiagram(data,options) {

	console.log("ZankeyDiagram")
	//console.log(data)

	var CURRENT_STATUS=0,
		statueses=data.flows.length;

	

	

	var WIDTH=options.width,
		HEIGHT=options.height,
		margins=options.margins;

	var bar_width=15,
		spacing=2;

	var extents;
	computeExtents();

	var ky = (HEIGHT-(margins.top+margins.bottom)-(extents.length*spacing)) / extents.y[1];

	computeNodes();

	console.log(data)

	
	

	console.log(extents)

	//var yscale=d3.scale.linear().domain(extents.y).range([0,HEIGHT-(margins.top+margins.bottom)])

	//console.log(data.countries)
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

	var flows_g=svg.append("g")
					.attr("class","flows")
					.attr("transform","translate("+margins.left+","+margins.top+")")

	var from_g=svg.append("g")
					.attr("class","from")
					.attr("transform","translate("+margins.left+","+margins.top+")")

	var to_g=svg.append("g")
					.attr("class","to")
					.attr("transform","translate("+(WIDTH-margins.right)+","+margins.top+")")

	

	update();

	function computeNodes() {

		
		console.log("KY",ky)

		//data.flows.forEach(function(flowset){

		var flowset=data.flows[CURRENT_STATUS]
		
			var from_y=[0,0];
			flowset.from.countries.forEach(function(country,i){

				//console.log("!!!",country)

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
				})
				//console.log("1",from_y[0],spacing)
				//console.log(spacing)
				from_y[0]+= spacing;
				from_y[1]+= spacing; 
				//console.log("2",from_y[0],spacing)
			});



			var to_y=[(extents.diffs[0]*spacing)/2,(extents.diffs[1]*spacing)/2];
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
				})
				to_y[0]+=spacing;
				to_y[1]+=spacing;
			})

		//})

		

		

	}
	function computeExtents() {
		
		extents= {
			y:[0,d3.max(data.flows,function(d){
				return d.from.total;
			})],
			length:d3.max(data.flows,function(d){
				return d.from.countries.length;
			}),
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
									showFlowsFrom(d.key);
								})

		new_countries.append("text")
					.attr("x",-2)
					.attr("dy","0.2em")
					.text(function(d){
						return d.key;
					})

		new_countries.append("rect")
					.attr("x",0)
					.attr("y",0)
					.attr("width",bar_width)
					.attr("class",function(d) {
						var area=data.countries.world.find(function(c){
							return c.c === d.key;
						})
						return "country "+area.a;
					})
		new_countries.append("rect")
					.attr("class","bg")
					.attr("x",-margins.left)
					.attr("y",-spacing/2)
					.attr("width",margins.left*2)

		from_countries.exit().remove();

		

		/*
		var toCountry=new_countries
							.selectAll("g.to-country")
								.data(function(d){
									//console.log(d)
									return d.values.flows;
								})
								.enter()
								.append("g")
									.attr("class","to-country")
									.attr("rel",function(d){
										return d.to;
									})
		
		toCountry.append("rect")
			.attr("x",0)
			.attr("y",0)
			.attr("width",bar_width)
			//.style("fill",function(d){
			//	return color_scale(d.from)
			//})
			.attr("class",function(d) {
				var area=data.countries.world.find(function(c){
					return c.c === d.from;
				})
				return area.a;
			})
		*/
		from_g.selectAll("g.country")
								.transition()
								.duration(1000)
								.attr("transform",function(d,i){
									var y=(d.values.flows[0].from_y[CURRENT_STATUS]);
									return "translate(0,"+(y)+")";
								})
								.style("opacity",1)
								/*
								.selectAll("g.to-country")
									.attr("transform",function(d){
										var y=(d.rel_from_y[CURRENT_STATUS]);
										return "translate(0,"+y+")";
									})
									.select("rect")
										.attr("height",function(d){
											return (d.flows[CURRENT_STATUS]*ky);
										})*/
		
		from_g.selectAll("g.country rect.country")
					.attr("height",function(d){
						return d3.max([0.5,d.values.sizes[CURRENT_STATUS] * ky]);
					})
		from_g.selectAll("g.country rect.bg")
					.attr("height",function(d){
						return d3.max([0.5,d.values.sizes[CURRENT_STATUS] * ky])+spacing/2;
					})

		from_g.selectAll("g.country text")
			.classed("hidden",function(d){
				return (d.values.sizes[CURRENT_STATUS]*ky)<(10-spacing*2);
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
									showFlowsTo(d.key);
								})

		new_countries.append("text")
					.attr("x",bar_width+2)
					.attr("dy","0.2em")
					.attr("y",function(d){
						//console.log(d);
						return (d.values.sizes[CURRENT_STATUS]*ky)/2;
					})
					.text(function(d){
						return d.key;
					})

		new_countries.append("rect")
					.attr("x",0)
					.attr("y",0)
					.attr("width",bar_width)
					.attr("class",function(d) {
						return "country "+d.key.replace(/\s/gi,"").toLowerCase();
					})

		
		new_countries.append("rect")
					.attr("class","bg")
					.attr("x",-margins.right)
					.attr("y",-spacing/2)
					.attr("width",margins.right*2)

		to_countries.exit().remove();

		/*
		var fromCountry=new_countries
							.selectAll("g.to-country")
								.data(function(d){
									return d.values.flows;
								})
								.enter()
								.append("g")
									.attr("class","from-country")
									.attr("rel",function(d){
										return d.from;
									})

									
		fromCountry.append("rect")
			.attr("x",0)
			.attr("y",0)
			.attr("width",bar_width)
			.attr("class",function(d){
				return d.to.replace(/\s/gi,"").toLowerCase();
			})
		*/
			

		to_g.selectAll("g.country")
								.transition()
								.duration(1000)
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
						return d3.max([0.5,d.values.sizes[CURRENT_STATUS] * ky]);
					})

		to_g.selectAll("g.country rect.bg")
					.attr("height",function(d){
						return d3.max([0.5,d.values.sizes[CURRENT_STATUS] * ky])+spacing/2;
					})

		to_g.selectAll("g.country text")
			.classed("hidden",function(d){
				return (d.values.sizes[CURRENT_STATUS]*ky)<(10-spacing*2);
			})
			.attr("y",function(d){
				return (d.values.sizes[CURRENT_STATUS]*ky)/2;
			})

								


		updateFlows();

	}

	function drawFlow(flow) {
		var curvature = .5;

		//console.log("--->",flow)

		var x0=0+bar_width+2,
			y0=(flow.from_y[CURRENT_STATUS]) + (flow.flows[CURRENT_STATUS]*ky)/2,
			x1=WIDTH-(margins.left+margins.right)-2,
			y1=(flow.to_y[CURRENT_STATUS]) + (flow.flows[CURRENT_STATUS]*ky)/2;

		var xi = d3.interpolateNumber(x0, x1),
			x2 = xi(curvature),
          	x3 = xi(1 - curvature)

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
							//console.log("!!!!",d)
							return d.from+"2"+d.to;
						});

		var new_flows=flows
							.enter()
							.append("g")
								.attr("class","flow")
								.attr("rel",function(d){
									return d.from+"2"+d.to;
								})
		flows.exit().remove();

		new_flows.append("path")
					.style("stroke",function(d){
						//return "#ff0000"
						var area=data.countries.world.find(function(c){
							return c.c === d.from;
						})

						return "url(#grad_"+area.a+"2"+d.to.replace(/\s/gi,"").toLowerCase()+")"
						//return color_scale(d.to)
					})

		flows_g.selectAll("g.flow")
					.select("path")
						.classed("opaque",function(d){
							return d.flows[CURRENT_STATUS]*ky<1
						})
						.transition()
						.duration(1000)
						.attr("d",drawFlow)
						.style("stroke-width",function(d){
							return d3.max([(d.flows[CURRENT_STATUS]*ky),0.5]);
						})
						

	}
	function showFlows() {
		svg.selectAll(".highlight").classed("highlight",false);
		svg.selectAll(".hidden:not(text)").classed("hidden",false);
	}
	function showFlowsFrom(src) {

		from_g.selectAll("g.country")
			.classed("highlight",function(d){
				return d.key === src;
			})

		flows_g
			.selectAll("g.flow")
			.classed("hidden",true)
			.classed("highlight",function(d){
				return d.from === src;
			})
	}
	function showFlowsTo(dst) {

		to_g.selectAll("g.country")
			.classed("highlight",function(d){
				return d.key === dst;
			})

		flows_g
			.selectAll("g.flow")
			.classed("hidden",true)
			.classed("highlight",function(d){
				return d.to === dst;
			})
	}

	this.update=function(){

	}

	this.resize=function(){
		
	}
}