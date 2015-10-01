import iframeMessenger from 'guardian/iframe-messenger'
import mainHTML from './text/main.html!text'
import iso from '../assets/data/iso.json!json'
import d3 from 'd3'
import queue from 'queue-async'
import Migration from './charts/Migration'

import RAF from './lib/raf'

export function init(el, context, config, mediator) {
    iframeMessenger.enableAutoResize();

    

    

    //createViz(1992,"#migration");
    //createViz(2015,"#migration");


    
    queue()
        .defer(d3.csv,config.assetPath+"/assets/data/asylum_applicants_2015.csv",function(d){
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
        .defer(d3.csv,config.assetPath+"/assets/data/asylum_applicants_1992.csv",function(d){
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
                    //console.log("FOUND",row)
                } else {
                    data.push({
                        from:d1992.from,
                        to:d1992.to,
                        flows:[d1992.total,0]
                    })      
                }
            })

            //console.log(data)
            el.innerHTML = mainHTML.replace(/%assetPath%/g, config.assetPath);

            var min_flow=1;

            (function checkInnerHTML() {
                var b=document.querySelector("#migration");

                if(b && b.getBoundingClientRect().height) {
                    
                    var migration1992=new Migration(data.filter(function(d){return d.flows[0]>min_flow || d.flows[1]>min_flow}),{
                        container:"#m1992 > .migration",
                        iso:iso,
                        status:0,
                        spacing:{
                            l:2,
                            r:2
                        },
                        country_colors:[1,1],
                        show_country_names:[1,1]
                    })
                    
                    
                    var migration2015=new Migration(data.filter(function(d){return d.flows[0]>min_flow || d.flows[1]>min_flow}),{
                        container:"#m2015 > .migration",
                        iso:iso,
                        status:1,
                        spacing:{
                            l:2,
                            r:2
                        },
                        country_colors:[1,1],
                        show_country_names:[1,1]
                    })
                    
                    

                    /*
                    d3.select("h3")
                        .selectAll("a")
                        .on("click",function(d,i){
                            d3.event.preventDefault();

                            migration.changeStatus(i);
                        })
                    */
                    
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

                    console.log(maxes)

                    var max=d3.max([

                        d3.max(maxes,function(d){
                            return d.values[0]
                        }),
                        d3.max(maxes,function(d){
                            return d.values[1]
                        })

                    ])

                    console.log(max)

                   
                    var countries=["Germany","Hungary","Italy","United Kingdom","France","Belgium","Greece","Spain","Austria","Sweden","Finland"]
                    
                    var str=`<div class="subsection">
                                <div class="sub-intro">
                                    <h2></h2>
                                    <p></p>
                                </div>
                                <div class="sub-contents"></div>
                            </div>`;


                    var row=d3.select("#countriesSMCompare")
                        .selectAll("div.countries-row")
                        .data(countries)
                        .enter()
                        .append("div")
                            .attr("class","countries-row");

                    row.append("div")
                        .append("div")
                        .attr("class","country-div")
                        .append("div")
                            .attr("class","migration")
                            .each(function(c){
                                var self=this;
                                new Migration(data.filter(function(d){
                                        return d.to === c && (d.flows[0]>min_flow || d.flows[1]>min_flow);
                                    }),{
                                    container:self,
                                    iso:iso,
                                    country:c+" 1992",
                                    auto:true,
                                    spacing:{
                                        l:2,
                                        r:2
                                    },
                                    max:max,
                                    status:0,
                                    country_colors:[1,0],
                                    show_country_names:[1,0]
                                })
                            })

                    row.append("div")
                        .append("div")
                        .attr("class","country-div")
                        .append("div")
                            .attr("class","migration")
                            .each(function(c){
                                var self=this;
                                new Migration(data.filter(function(d){
                                        return d.to === c && (d.flows[0]>min_flow || d.flows[1]>min_flow);
                                    }),{
                                    container:self,
                                    iso:iso,
                                    country:c+" 2015",
                                    auto:true,
                                    spacing:{
                                        l:2,
                                        r:2
                                    },
                                    max:max,
                                    status:1,
                                    country_colors:[1,0],
                                    show_country_names:[1,0]
                                })
                            })
                    /*

                    d3.select("#countriesSM")
                        .selectAll("div.country")
                        .data(countries)
                        .enter()
                        .append("div")
                            .attr("class","country-div")
                                .append("div")
                                .attr("class","migration")
                                .each(function(c){
                                    var self=this;
                                    new Migration(data.filter(function(d){
                                            return d.to === c && (d.flows[0]>0 || d.flows[1]>0);
                                        }),{
                                        container:self,
                                        iso:iso,
                                        country:c,
                                        max:max,
                                        status:1,
                                        country_colors:[1,0],
                                        show_country_names:[1,0]
                                    })
                                })
                    */
                    return;
                    
                };
                window.requestAnimationFrame(checkInnerHTML);   
            }());
            

            
            

            

        })


    /*function createViz(year,container) {
        d3.csv(config.assetPath+"/assets/data/asylum_applicants_"+year+".csv",function(d){
            d.latest=0;
            d.latest_month=0;
            d.total=0;


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
        },function(data){
                new Migration(data.filter(function(d){return d.total>0}),{
                    container:container,
                    year:year
                })
        })
    }*/
    

    
}
