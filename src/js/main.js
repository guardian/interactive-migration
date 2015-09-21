import iframeMessenger from 'guardian/iframe-messenger'
import mainHTML from './text/main.html!text'
import d3 from 'd3'
import Migration from './charts/Migration'


export function init(el, context, config, mediator) {
    iframeMessenger.enableAutoResize();

    el.innerHTML = mainHTML.replace(/%assetPath%/g, config.assetPath);


    d3.csv(config.assetPath+"/assets/data/asylum_applicants.csv",function(d){
        d.latest=0;
        d.latest_month=0;
        d.total=0;
        d3.range(7).forEach(function(i){
            d["2015M0"+(i+1)]= +d["2015M0"+(i+1)];
            d.latest= d["2015M0"+(i+1)] || d.latest;
            d.latest_month= d["2015M0"+(i+1)]?"2015M0"+(i+1):d.latest_month;
            d.total= d.total + (d["2015M0"+(i+1)] || 0)
        })
        

        return d;
    },function(data){
        //console.log(data)

        new Migration(data.filter(function(d){return d.total>0}),{
            container:"#migration"
        })

    })
    
}
