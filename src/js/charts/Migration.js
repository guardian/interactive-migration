import d3 from 'd3'
import ZankeyDiagram from './ZankeyDiagram'

export default function Migration(data,options) {

	console.log("Migration")
	console.log(data)

	

	var container=d3.select(options.container)
			.append("div")
			.attr("class","diagram")

	var size=container.node().getBoundingClientRect(),
		width=size.width,
		height=size.height;

	var diagram;

	
	
	var processed_data;


	;(function init(){

		updateData();

		diagram=new ZankeyDiagram(processed_data,{
			container:container.node(),
			margins:{
				top:20,
				left:150,
				right:150,
				bottom:20
			},
			width:width,
			height:height,
			filter:null,
			areas:["africa","americas","asia","europe","oceania","namerica","samerica"]
		});

	}(data));

	function updateData() {

		data=data.filter(function(d){
			return d.from!=="Asia" && d.from!=="Africa" && d.from!=="Oceania" 
					&& d.from!== "America" && d.from!=="Unknown" && d.from !== "Stateless"
					&& d.from !== "Central and Eastern Europe" && d.from !== "Other european countries"
		})

		var from_data=d3.nest()
						.key(function(d){
							return d.from;
						})
						.rollup(function(leaves){
							return {
								/*size2015:d3.sum(leaves,function(d){
									return d.flows[1];
								}),
								size1992:d3.sum(leaves,function(d){
									return d.flows[0];
								}),*/
								sizes:[d3.sum(leaves,function(d){
											return d.flows[0];
										}),
										d3.sum(leaves,function(d){
											return d.flows[1];
										})
								],
								flows:leaves
							}
						})
						.entries(data)

		var to_data=d3.nest()
						.key(function(d){
							return d.to;
						})
						.rollup(function(leaves){
							return {
								/*size2015:d3.sum(leaves,function(d){
									return d.flows[1];
								}),
								size1992:d3.sum(leaves,function(d){
									return d.flows[0];
								}),*/
								sizes:[d3.sum(leaves,function(d){
											return d.flows[0];
										}),
										d3.sum(leaves,function(d){
											return d.flows[1];
										})
								],
								flows:leaves
							}
						})
						.entries(data)
		var region_codes={
			"002":"africa",
			"019":"americas",
			"142":"asia",
			"150":"europe",
			"009":"oceania"
		}
		var sub_region_codes={
			"021":"namerica",
			"005":"samerica",
			"013":"samerica"
		}
		var countries={
			world:from_data.map(function(d){
				var iso=options.iso.find(function(c){
					return c.name === d.key || c.name2 === d.key;
				}),
					area=iso?iso["region-code"]:0,
					subarea=iso?iso["sub-region-code"]:0;
				if(!area) {
					console.log("NOT FOUND",d.key,area,iso)
				}
				if(region_codes[area]=="americas"){

				}
				return {
					c:d.key,
					//a:region_codes[area==="019"?subarea:area]
					a:region_codes[area]
				}
			}),
			europe:to_data.map(function(d){
				return d.key;
			})
		}

		processed_data={
			flows:[
				{
					from:{
						total:d3.sum(from_data,function(d){
							return d.values.sizes[0];
						}),
						countries:from_data.filter(function(d){return d.values.sizes[0]>0}).map(function(d){return d}).sort(function(a,b){
							return b.values.sizes[0] - a.values.sizes[0];
						})
					},
					to:{
						total:d3.sum(to_data,function(d){
							return d.values.sizes[0];
						}),
						countries:to_data.filter(function(d){return d.values.sizes[0]>0}).map(function(d){return d}).sort(function(a,b){
							return b.values.sizes[0] - a.values.sizes[0];
						})
					}
				},
				{
					from:{
						total:d3.sum(from_data,function(d){
							return d.values.sizes[1];
						}),
						countries:from_data.filter(function(d){return d.values.sizes[1]>0}).map(function(d){return d}).sort(function(a,b){
							return b.values.sizes[1] - a.values.sizes[1];
						})
					},
					to:{
						total:d3.sum(to_data,function(d){
							return d.values.sizes[1];
						}),
						countries:to_data.filter(function(d){return d.values.sizes[1]>0}).map(function(d){return d}).sort(function(a,b){
							return b.values.sizes[1] - a.values.sizes[1];
						})
					}
				}
			],
			data:data,
			countries: countries
		}

	}

	this.changeStatus=function(status) {
		diagram.changeStatus(status);
	}

	function setExtents() {

	}

	function update(){
		diagram.update();
	}

	function resize(){

		var size=d3.select(options.container).node().getBoundingClientRect();
			this.width=size.width;

		diagram.update(this.width);
	}

}