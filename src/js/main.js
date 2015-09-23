import iframeMessenger from 'guardian/iframe-messenger'
import mainHTML from './text/main.html!text'
import d3 from 'd3'
import queue from 'queue-async'
import Migration from './charts/Migration'


export function init(el, context, config, mediator) {
    iframeMessenger.enableAutoResize();

    el.innerHTML = mainHTML.replace(/%assetPath%/g, config.assetPath);

    

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

            
            window.migration=new Migration(data.filter(function(d){return d.flows[0]>0 || d.flows[1]>0}),{
                container:"#migration"
            })

            d3.select("h3")
                .selectAll("a")
                .on("click",function(d,i){
                    d3.event.preventDefault();

                    migration.changeStatus(i);
                })

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
