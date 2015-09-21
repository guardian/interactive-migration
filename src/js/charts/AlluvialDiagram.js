import d3 from 'd3'

export default function AlluvialDiagram(data,options) {

	console.log("AlluvialDiagram")
	console.log(data)

	computeNodes();

	var extents;
	computeExtents();


	var WIDTH=options.width,
		HEIGHT=options.height,
		margins=options.margins;

	var bar_width=10;

	var yscale=d3.scale.linear().domain(extents.y).range([0,HEIGHT-(margins.top+margins.bottom)])

	var color_scale = d3.scale.ordinal()
			    .domain(data.countries)
			    .range(['rgb(166,206,227)','rgb(31,120,180)','rgb(178,223,138)','rgb(51,160,44)','rgb(251,154,153)','rgb(227,26,28)','rgb(253,191,111)','rgb(255,127,0)','rgb(202,178,214)','rgb(106,61,154)','rgb(255,255,153)','rgb(177,89,40)'])
			    //.range(["#67001f","#b2182b","#d6604d","#f4a582","#fddbc7","#f7f7f7","#d1e5f0","#92c5de","#4393c3","#2166ac","#053061"]); 

	var svg=d3.select(options.container)
				.append("svg")
				.attr("class","alluvial-diagram")


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

		var from_y=0;
		data.from.countries.forEach(function(country,i){
			var rel_y=0;
			country.values.flows.forEach(function(flow){
				flow.from_y=from_y;
				flow.rel_from_y=rel_y;
				from_y+=flow.total;
				rel_y+=flow.total;
			})

		})

		var to_y=0;
		data.to.countries.forEach(function(country,i){
			var rel_y=0;
			country.values.flows.forEach(function(flow){
				flow.to_y=to_y;
				flow.rel_to_y=rel_y;
				to_y+=flow.total;
				rel_y+=flow.total;
			})

		})

	}
	function computeExtents() {
		console.log("DATA",data.from.total)
		extents= {
			y:[0,data.from.total]
		}
	}

	function update() {

		// FROM

		var from_countries=from_g.selectAll("g.country")
				.data(data.from.countries,function(d){
					return d.key;
				});

		var new_countries=from_countries
							.enter()
							.append("g")
								.attr("class","country")
								.attr("rel",function(d){
									return d.key;
								})
								

		from_countries.exit().remove();

		var toCountry=new_countries
							.selectAll("g.to-country")
								.data(function(d){
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
								.attr("transform",function(d){
									var y=yscale(d.values.flows[0].from_y);
									return "translate(0,"+y+")";
								})
								.selectAll("g.to-country")
									.attr("transform",function(d){
										var y=yscale(d.rel_from_y);
										return "translate(0,"+y+")";
									})
									.select("rect")
										.attr("height",function(d){
											return yscale(d.total);
										})

		// TO
		var to_countries=to_g.selectAll("g.country")
				.data(data.to.countries,function(d){
					return d.key;
				});

		new_countries=to_countries
							.enter()
							.append("g")
								.attr("class","country")
								.attr("rel",function(d){
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
								.attr("transform",function(d){
									var y=yscale(d.values.flows[0].to_y);
									return "translate(0,"+y+")";
								})
								.selectAll("g.from-country")
									.attr("transform",function(d){
										var y=yscale(d.rel_to_y);
										return "translate(0,"+y+")";
									})
									.select("rect")
										.attr("height",function(d){
											return yscale(d.total);
										})


		updateFlows();

	}

	function drawFlow(flow) {
		var curvature = .5;

		var x0=0+bar_width+2,
			y0=yscale(flow.from_y) + yscale(flow.total)/2,
			x1=WIDTH-(margins.left+margins.right)-2,
			y1=yscale(flow.to_y) + yscale(flow.total)/2;

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
						.data(data.flows,function(d){
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
					.attr("d",drawFlow)
					.style("stroke-width",function(d){
						return yscale(d.total);
					})
					.style("stroke",function(d){
						return color_scale(d.to)
					})

	}

	this.update=function(){

	}

	this.resize=function(){
		
	}
}