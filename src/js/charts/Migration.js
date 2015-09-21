import d3 from 'd3'
import AlluvialDiagram from './AlluvialDiagram'

export default function Migration(data,options) {

	console.log("Migration")
	console.log(data)

	var size=d3.select(options.container).node().getBoundingClientRect(),
		width=size.width,
		height=size.height;

	var diagram;

	var processed_data;


	;(function init(){

		updateData();

		diagram=new AlluvialDiagram(processed_data,{
			container:options.container,
			margins:{
				top:20,
				left:20,
				right:20,
				bottom:20
			},
			width:width,
			height:height
		});

	}(data));

	function updateData() {

		var from_data=d3.nest()
						.key(function(d){
							return d.from;
						})
						.rollup(function(leaves){
							return {
								size:d3.sum(leaves,function(d){
									return d.total;
								}),
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
								size:d3.sum(leaves,function(d){
									return d.total;
								}),
								flows:leaves
							}
						})
						.entries(data)

		var countries={
			world:[],
			europe:to_data.map(function(d){return d.key})
		}

		processed_data={
			from:{
				total:d3.sum(from_data,function(d){
					return d.values.size;
				}),
				countries:from_data.sort(function(a,b){
					return b.values.size - a.values.size;
				})
			},
			to:{
				total:d3.sum(to_data,function(d){
					return d.values.size;
				}),
				countries:to_data.sort(function(a,b){
					return b.values.size - a.values.size;
				})
			},
			flows:data,
			countries: countries
		}

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