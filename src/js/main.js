import iframeMessenger from 'guardian/iframe-messenger'
import mainHTML from './text/main.html!text'
import iso from '../assets/data/iso.json!json'
import d3 from 'd3'
import queue from 'queue-async'
import Migration from './charts/Migration'
import scrollReveal from 'scrollreveal'
import RAF from './lib/raf'
import { getViewport } from './lib/detect'


export function init(el, context, config, mediator) {
    iframeMessenger.enableAutoResize();
    

    //createViz(1992,"#migration");
    //createViz(2015,"#migration");

    if (!Array.prototype.find) {
      Array.prototype.find = function(predicate) {
        if (this === null) {
          throw new TypeError('Array.prototype.find called on null or undefined');
        }
        if (typeof predicate !== 'function') {
          throw new TypeError('predicate must be a function');
        }
        var list = Object(this);
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        var value;

        for (var i = 0; i < length; i++) {
          value = list[i];
          if (predicate.call(thisArg, value, i, list)) {
            return value;
          }
        }
        return undefined;
      };
    }

    
    queue()
        .defer(d3.csv,config.assetPath+"/assets/data/asylum_applicants_2015_oct.csv",function(d){
            d.latest=0;
            d.latest_month=0;
            d.total=0;
            var year=2015;

            function z(d) { return d>9?d:"0"+d};

            d3.range(12).forEach(function(i){

                if(d[year+"M"+z(i+1)]) {
                    d[year+"M"+z(i+1)]= +(d[year+"M"+z(i+1)].replace(/,/gi,""));

                    d.latest= d[year+"M"+z(i+1)] || d.latest;
                    d.latest_month= d[year+"M"+z(i+1)]?year+"M"+z(i+1):d.latest_month;
                    d.total= d.total + (d[year+"M"+z(i+1)] || 0)    

                }
                
            })
            

            return d;
        })
        .defer(d3.csv,config.assetPath+"/assets/data/asylum_applicants_continents_1992.csv",function(d){
            d.latest=0;
            d.latest_month=0;
            d.total=0;
            var year=1992;

            function z(d) { return d>9?d:"0"+d};

            d3.range(12).forEach(function(i){

                if(d[year+"M"+z(i+1)]) {
                    d[year+"M"+z(i+1)]= +(d[year+"M"+z(i+1)].replace(/,/gi,""));

                    d.latest= d[year+"M"+z(i+1)] || d.latest;
                    d.latest_month= d[year+"M"+z(i+1)]?year+"M"+z(i+1):d.latest_month;
                    d.total= d.total + (d[year+"M"+z(i+1)] || 0)    
                }
                
            })
            

            return d;
        })
        .await(function(error, data2015, data1992) {
            /*new Migration(data2015.filter(function(d){return d.total>0}),{
                container:"#migration",
                year:2015
            })*/
            var data=[];
            data2015.forEach(function(d2015){

                data.push({
                    from:d2015.from,
                    to:d2015.to,
                    flows:[0,d2015.total]
                });

            })

            data1992.forEach(function(d1992){
                var row=data.find(function(d){
                    return (d1992.to === d.to && d1992.from === d.from);
                })
                if(row) {

                    row.flows[0]=d1992.total;
                    //////console.log("FOUND",row)
                } else {
                    data.push({
                        from:d1992.from,
                        to:d1992.to,
                        flows:[d1992.total,0]
                    })      
                }
            })
            /*
            //console.log(d3.sum(data1992.filter(function(d){return d.from==="Asia"}),function(d){
                return d.total
            }))

            var sum=0;
            data1992.forEach(function(d){
                var r=iso.find(function(c){
                    return (c.name==d.from || c.name2==d.from) && c["region-code"]=="142"
                })
                if(r) {
                    //////console.log(d.from,d.to,d.total)    
                    sum+=d.total;


                }
                
            })
            */
            data1992.forEach(function(d){
                var r=iso.find(function(c){
                    return (c.name==d.from || c.name2==d.from)
                })
                if(r) {
                    d.region=r["region-code"];
                    d.subregion=r["sub-region-code"]
                }
                
            })

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
                //Central and Eastern Europe
                //Other european countries
                //America
                //Asia
                //Africa
            }
            
            var nested=d3.nest()
                .key(function(d){
                     return region_codes[d.region];
                })
                .entries(data1992)

            //console.log(nested)
            var listed={};
            nested.forEach(function(d){
                //console.log(d)
                if(!listed[d.key]) {
                    listed[d.key]=[];
                }
                d.values.forEach(function(f){
                    if(listed[d.key].indexOf(f.from)<0) {
                        listed[d.key].push(f.from);

                    }
                })
            })
            ////console.log(listed)
            //return;
            
            /*data=data.filter(function(d){
                return d.from!=="Asia" && d.from!=="Africa" && d.from!=="Oceania" 
                        && d.from!== "America" && d.from!=="Unknown" && d.from !== "Stateless"
                        && d.from !== "Central and Eastern Europe" && d.from !== "Other european countries"
            })*/

            //////console.log(data)
            el.innerHTML = mainHTML.replace(/%assetPath%/g, config.assetPath);

            var min_flow=0;

            (function checkInnerHTML() {
                var b=document.querySelector(".interactive-container #migration");

                if(b && b.getBoundingClientRect().height) {
                    
                    buildCharts();
                    return;
                };
                //window.requestAnimationFrame(checkInnerHTML);   
            }());
            

            function buildCharts() {
                var viewport=getViewport();
                var isSmallScreen=viewport.width<740;

                d3.select("#m1992 h3")
                    .text(d3.format(",.0f")(d3.sum(data,function(d){return d.flows[0]})))
                d3.select("#m2015 h3")
                    .text(d3.format(",.0f")(d3.sum(data,function(d){return d.flows[1]})))
               
                
                var migration1992=new Migration(data.filter(function(d){return d.flows[0]>min_flow || d.flows[1]>min_flow}),{
                    container:"#m1992 > .migration",
                    iso:iso,
                    status:0,
                    spacing:{
                        l:0,
                        r:0
                    },
                    margins:isSmallScreen?{
                        top:25,
                        left:70,
                        right:70,
                        bottom:15 
                    }:null,
                    showLegend:[1,0],
                    showAll:[
                        [0,0],
                        [0,0]
                    ],
                    country_colors:[1,1],
                    year:1992,
                    show_country_names:[1,1],
                    show_country_numbers:[1,1],
                    inner_labels:[1,1],
                    topAligned:isSmallScreen,
                    legend:true,
                    defaultCountries:{
                        from:0,
                        to:"Germany"
                    },
                    /*clickCallback:function(d){
                        console.log(d);
                        migration2015.showFlowsFromArea(d.d,d.from);
                    },*/
                    mouseoverCallback:function(d){
                        migration2015.showFlows(d.d,d.from);
                    },
                    mouseleaveCallback:function(d){
                        migration2015.showFlows();
                    }
                })
                //return;
                
                var migration2015=new Migration(data.filter(function(d){return d.flows[0]>min_flow || d.flows[1]>min_flow}),{
                    container:"#m2015 > .migration",
                    iso:iso,
                    status:1,
                    spacing:{
                        l:0,
                        r:0
                    },
                    margins:isSmallScreen?{
                        top:25,
                        left:70,
                        right:70,
                        bottom:15 
                    }:null,
                    country_colors:[1,1],
                    year:2015,
                    show_country_names:[1,1],
                    show_country_numbers:[1,1],
                    showAll:[
                        [0,0],
                        [0,0]
                    ],
                    inner_labels:[1,1],
                    topAligned:isSmallScreen,
                    legend:true,
                    defaultCountries:{
                        from:0,
                        to:"Germany"
                    },
                    mouseoverCallback:function(d){
                        migration1992.showFlows(d.d,d.from);
                    },
                    mouseleaveCallback:function(d){
                        migration1992.showFlows();
                    }
                })
                
                window.sr = new scrollReveal();

               
                
                var maxes=d3.nest()
                            .key(function(d){
                                return d.to;
                            })
                            .rollup(function(leaves){
                                return [
                                    d3.sum(leaves,function(d){
                                        return d.flows[0]
                                    }),
                                    d3.sum(leaves,function(d){
                                        return d.flows[1]
                                    })
                                ]
                            })
                            .entries(data)

                ////console.log(maxes)

                var max=d3.max([

                    d3.max(maxes,function(d){
                        return d.values[0]
                    }),
                    d3.max(maxes,function(d){
                        return d.values[1]
                    })

                ])
                
                var flows={
                    from:[],
                    to:[]
                }

                d3.select("#countriesSMCompareFrom")
                    .selectAll("div.subsection")
                        .selectAll("div.sub-contents")
                            .select("div.sub-chart")
                            .selectAll("div.country-div")
                            .data(function(d,i){
                                ////console.log(this.parentNode.getAttribute("rel"))
                                return [
                                    {
                                        c:this.parentNode.getAttribute("rel"),
                                        year:2015,
                                        status:1,
                                        index:i
                                    }
                                ]
                            })
                            .enter()
                            .append("div")
                                .attr("class","country-div")
                                .append("div")
                                    .attr("class","migration")
                                    .each(function(c){
                                        var self=this;
                                        
                                        if(!flows.from[c.index]) {
                                            flows.from.push([])    
                                        }
                                        flows.from[c.index].push(
                                                new Migration(data.filter(function(d){
                                                    return d.from === c.c && (d.flows[0]>min_flow || d.flows[1]>min_flow);
                                                }),{
                                                container:self,
                                                iso:iso,
                                                country:c.c,
                                                //title:`${c.year}`,
                                                auto:false,
                                                spacing:{
                                                    l:0,
                                                    r:2
                                                },
                                                isSmallScreen:isSmallScreen,
                                                legend:false,
                                                inner_labels:[0,1],
                                                margins:isSmallScreen?{
                                                    top:45,
                                                    left:70,
                                                    right:80,
                                                    bottom:45 
                                                }:{
                                                    top:35,
                                                    left:c.status?90:90,
                                                    right:c.status?110:110,
                                                    bottom:45
                                                },
                                                max:162000,
                                                status:c.status,
                                                showAll:[
                                                    [0,0],
                                                    [0,0]
                                                ],
                                                country_colors:[1,1],
                                                show_country_names:[isSmallScreen?1:1,1],
                                                show_country_numbers:[1,1],
                                                topAligned:false,
                                                defaultCountries:{
                                                    from:c.c,
                                                    to:0
                                                },
                                                /*,
                                                mouseoverCallback:function(d){
                                                    flows.to[c.index][1-c.status].showFlows(d.d,d.from);
                                                },
                                                mouseleaveCallback:function(d){
                                                    flows.to[c.index][1-c.status].showFlows();
                                                }*/
                                            })
                                        );
                                    })
                
                d3.select("#countriesSMCompareTo")
                    .selectAll("div.subsection")
                        .select("div.sub-contents")
                            .selectAll("div.country-div")
                            .data(function(d,i){
                                ////console.log(this.parentNode.getAttribute("rel"))
                                return [
                                    {
                                        c:this.parentNode.getAttribute("rel"),
                                        year:1992,
                                        status:0,
                                        index:i
                                    },
                                    {
                                        c:this.parentNode.getAttribute("rel"),
                                        year:2015,
                                        status:1,
                                        index:i
                                    }
                                ]
                            })
                            .enter()
                            .append("div")
                                .attr("class","country-div")
                                .append("div")
                                    .attr("class","migration")
                                    .each(function(c){
                                        var self=this;
                                        
                                        if(!flows.to[c.index]) {
                                            flows.to.push([])    
                                        }
                                        flows.to[c.index].push(
                                                new Migration(data.filter(function(d){
                                                    return d.to === c.c && (d.flows[0]>min_flow || d.flows[1]>min_flow);
                                                }),{
                                                container:self,
                                                iso:iso,
                                                country:c.c,
                                                title:`${c.year}`,
                                                auto:c.c==="Germany"?false:true,
                                                spacing:{
                                                    l:c.c==="Romania"?(isSmallScreen?14:18):2,
                                                    r:0
                                                },
                                                isSmallScreen:isSmallScreen,
                                                legend:false,
                                                inner_labels:[1,0],
                                                margins:isSmallScreen?{
                                                    top:15,
                                                    left:80,
                                                    right:70,
                                                    bottom:15 
                                                }:{
                                                    top:15,
                                                    left:c.status?120:85,
                                                    right:c.status?90:90,
                                                    bottom:15
                                                },
                                                max:c.c==="Germany"?180000:false,
                                                status:c.status,
                                                country_colors:[1,1],
                                                showAll:[
                                                    [0,0],
                                                    [0,0]
                                                ],
                                                show_country_names:[1,isSmallScreen?1:0],
                                                show_country_numbers:[1,1],
                                                topAligned:false,
                                                defaultCountries:{
                                                    from:0,
                                                    to:c.c
                                                }/*,
                                                mouseoverCallback:function(d){
                                                    flows.to[c.index][1-c.status].showFlows(d.d,d.from);
                                                },
                                                mouseleaveCallback:function(d){
                                                    flows.to[c.index][1-c.status].showFlows();
                                                }*/
                                            })
                                        );
                                    })
            }
            

            

        })



    
}
