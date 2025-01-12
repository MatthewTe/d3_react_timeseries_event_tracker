document.addEventListener("DOMContentLoaded", () => {

const width = 1200;
const height = 800;
const marginTop = 20;
const marginRight = 20;
const marginBottom = 30;
const marginLeft = 40;

//2021-09-02T00:00:00.000Z
const formattedData = new Array()
d3.csv("http://127.0.0.1:5500/d3_html_example/data/RKLB_stock_data.csv")
    .then(csvData => {
        csvData.forEach(row => {
            formattedData.push({
                close: Number(row.close),
                volume: Number(row.volume),
                date: d3.timeParse("%Y-%m-%dT%H:%M:%S.%fZ")(row.date)

            })
        })

        const x = d3.scaleTime()
            .domain(d3.extent(formattedData, d => d.date))
            .range([marginLeft, width - marginRight]);

        
        const maxClosePrice = d3.max(formattedData, d => d.close)

        const y = d3.scaleLinear()
            .domain([0, maxClosePrice])
            .range([height - marginBottom, marginTop])


        const svg = d3.create("svg")
            .attr("width", width)
            .attr("height", height)

        svg.append("g")
            .attr("transform", `translate(0, ${height - marginBottom})`)
            .call(d3.axisBottom(x));
        
        svg.append("g")
            .attr("transform", `translate(${marginLeft}, 0)`)
            .call(d3.axisLeft(y));
        
        svg.append("path")
            .datum(formattedData)
            .attr("fill", "none")
            .attr("stroke", "#69b3a2")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(d => x(d.date))
                .y(d => y(d.close))
            )

        // Load in points from open insider:
        const form4Trades = new Array()
        d3.csv("http://127.0.0.1:5500/d3_html_example/data/open_insider_info.csv")
            .then(resp => {
                resp.forEach(row => {
                   form4Trades.push({
                        name: row.Insider_Name,
                        title: row.Title, 
                        tradeType: row.Trade_Type,
                        price: Number(row.Price.replace("$", "")),
                        quantity: row.Qty,
                        totalOwned: row.Owned, 
                        changeOwnership: row.Change_Owned,
                        date: d3.timeParse("%Y-%m-%d")(row.Trade_Date)
                    })
                })

                svg.append("g")
                    .selectAll("dot")
                    .data(form4Trades)
                    .enter()
                    .append('circle')
                    .attr("class", "form4Event")
                    .attr("cx", d => x(d.date))
                    .attr("cy", d => y(d.price))
                    .attr("r", 5)
                    .attr("fill", "#69b3a2")
                

                // Popup tooltip:
                const tooltip = d3.select("#hoverInfo")
                    .text("")
                    .attr("class", "tooltip")


                svg.selectAll(".form4Event")
                    .on("mouseover", function(e, d) {
                        d3.select(this)
                            .style("fill", "red")

                        var tooltipLabel = `
                            ${d.name} - ${d.tradeType} of ${d.quantity} shares at $${d.price}. \n
                            Total Ownership: ${d.totalOwned} shares and a change of ownership of ${d.changeOwnership}%
                            `

                        tooltip
                            .text(tooltipLabel)
                            .attr("transform", `translate(${x(d.date)}, ${y(d.price)})`)
                            .style("opacity", 1)
                    })
                    .on("mouseout", function() {
                        d3.selectAll(".form4Event")
                            .style("fill", "#69b3a2")

                        tooltip.style("opacity", 0);

                    })

                container.append(svg.node());

            })
    })
})