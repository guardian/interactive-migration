import d3 from 'd3'
import { palette1 } from '../lib/colors'

export default function ZankeyDiagram(data,options) {

	console.log("ZankeyDiagram")
	//console.log(data)

	var CURRENT_STATUS=0,
		statueses=data.flows.length;

	computeNodes();

	console.log(data)

	

	
	var extents;
	computeExtents();

	console.log(extents)

	

	var WIDTH=options.width,
		HEIGHT=options.height,
		margins=options.margins;

	var bar_width=10;

	var yscale=d3.scale.linear().domain(extents.y).range([0,HEIGHT-(margins.top+margins.bottom)])

	var color_scale = d3.scale.ordinal()
			    .domain(data.countries)
			    .range(palette1)
			    //.range(["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#f7f7f7","#d1e5f0","#92c5de","#4393c3","#2166ac","#053061"]); 

	var svg=d3.select(options.container)
				.append("svg")
				.attr("class","zankey-diagram")


	var from_g=svg.append("g")
					.attr("class","from")
					.attr("transform","translate("+margins.left+","+margins.top+")")

	var to_g=svg.append("g")
					.attr("class","to")
					.attr("transform","translate("+(WIDTH-margins.right)+","+margins.top+")")

	var flows_g=svg.append("g")
					.attr("class","flows")
					.attr("transform","translate("+margins.left+","+margins.top+")")

	update();

	function computeNodes() {

		

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

					from_y[0]+=flow.flows[0];
					rel_y[0]+=flow.flows[0];

					from_y[1]+=flow.flows[1];
					rel_y[1]+=flow.flows[1];
				})
			})

			var to_y=[0,0];
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

					to_y[0]+=flow.flows[0];
					rel_y[0]+=flow.flows[0];

					to_y[1]+=flow.flows[1];
					rel_y[1]+=flow.flows[1];
				})

			})

		//})

		

		

	}
	function computeExtents() {
		
		extents= {
			y:[0,d3.max(data.flows,function(d){
				return d.from.total;
			})]
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

		from_countries.exit().remove();

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
			.style("fill",function(d){
				return color_scale(d.from)
			})
			

		from_g.selectAll("g.country")
								.transition()
								.duration(1000)
								.attr("transform",function(d){
									var y=yscale(d.values.flows[0].from_y[CURRENT_STATUS]);
									return "translate(0,"+y+")";
								})
								.style("opacity",1)
								.selectAll("g.to-country")
									.attr("transform",function(d){
										var y=yscale(d.rel_from_y[CURRENT_STATUS]);
										return "translate(0,"+y+")";
									})
									.select("rect")
										.attr("height",function(d){
											return yscale(d.flows[CURRENT_STATUS]);
										})
		from_g.selectAll("g.country text")
			.classed("hidden",function(d){
				return yscale(d.values.sizes[CURRENT_STATUS])<10;
			})
			.attr("y",function(d){
				return yscale(d.values.sizes[CURRENT_STATUS])/2;
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
						return yscale(d.values.sizes[CURRENT_STATUS])/2;
					})
					.text(function(d){
						return d.key;
					})
								

		to_countries.exit().remove();

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
			.style("fill",function(d){
				return color_scale(d.to)
			})
			

		to_g.selectAll("g.country")
								.transition()
								.duration(1000)
								.attr("transform",function(d){
									var y=yscale(d.values.flows[0].to_y[CURRENT_STATUS]);
									return "translate(0,"+y+")";
								})
								.style("opacity",1)
								.selectAll("g.from-country")
									.attr("transform",function(d){
										var y=yscale(d.rel_to_y[CURRENT_STATUS]);
										return "translate(0,"+y+")";
									})
									.select("rect")
										.attr("height",function(d){
											return yscale(d.flows[CURRENT_STATUS]);
										})

		to_g.selectAll("g.country text")
			.classed("hidden",function(d){
				return yscale(d.values.sizes[CURRENT_STATUS])<10;
			})
			.attr("y",function(d){
				return yscale(d.values.sizes[CURRENT_STATUS])/2;
			})

								


		updateFlows();

	}

	function drawFlow(flow) {
		var curvature = .5;

		//console.log("--->",flow)

		var x0=0+bar_width+2,
			y0=yscale(flow.from_y[CURRENT_STATUS]) + yscale(flow.flows[CURRENT_STATUS])/2,
			x1=WIDTH-(margins.left+margins.right)-2,
			y1=yscale(flow.to_y[CURRENT_STATUS]) + yscale(flow.flows[CURRENT_STATUS])/2;

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
						return color_scale(d.to)
					})

		flows_g.selectAll("g.flow")
					.select("path")
						.transition()
						.duration(1000)
						.attr("d",drawFlow)
						.style("stroke-width",function(d){
							return yscale(d.flows[CURRENT_STATUS]);
						})
						

	}

	function showFlowsFrom(src) {
		flows_g
			.selectAll("g.flow")
			.classed("hidden",true)
			.classed("highlight",function(d){
				return d.from === src;
			})
	}
	function showFlowsTo(dst) {
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