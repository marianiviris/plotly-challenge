function buildMetadata(sample) {

    // Use `d3.json` to fetch the metadata for a sample
      // Use d3 to select the panel with id of `#sample-metadata`
      // Use `.html("") to clear any existing metadata
      // Use `Object.entries` to add each key and value pair to the panel
      // Hint: Inside the loop, you will need to use d3 to append new
      // tags for each key-value in the metadata.

      var sample_metadata_panel = d3.select("#sample-metadata").html("");
      var metadata_url = `/metadata/${sample}`;
      console.log(metadata_url);
      d3.json(metadata_url).then(function(metadata_sample){
        panel_list = Object.entries(metadata_sample);
        console.log(panel_list);
        panel_list.forEach((item => {
          sample_metadata_panel.append("p")
            .text(item[0]+ " : "+ item[1]);
        }));
  
        // BONUS BONUS BONUS // 
  var wFreq = panel_list[5][1];
    console.log(wFreq);

         d3.select("#gauge").html("");
         var traceGauge = {
           type: "pie",
           showlegend: false,
           hole: 0.4,
           rotation: 90,
           values: [100 / 9, 100 / 9, 100 / 9, 100 / 9, 100 / 9, 100 / 9, 100 / 9, 100 / 9, 100 / 9, 100],
           text: ["0-1", "1-2", "2-3", "3-4", "4-5", "5-6", "6-7", "7-8", "8-9", ""],
           direction: "clockwise",
           textinfo: "text",
           textposition: "inside",
           marker: {
             colors: ['rgba(10, 20, 0, .5)','rgba(44, 157, 10, .5)', 'rgba(110, 184, 42, .5)',
             'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
             'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
             'rgba(242, 226, 202, .5)','rgba(252, 236, 202, .5)',
             'rgba(255, 255, 255, 0)']
           },
           labels: ["0-1", "1-2", "2-3", "3-4", "4-5", "5-6", "6-7", "7-8", "8-9", "null"],
           hoverinfo: "label"
         };
         var degrees = wFreq*20;
         radius = 0.2;
         var radians = degrees * Math.PI / 180;
         var x = -1*radius * Math.cos(radians) + 0.5;
         var y = radius * Math.sin(radians) + 0.5;
         console.log(`x value: ${x}`);
         console.log(`y value: ${y}`);
         var layout = {
           shapes:[{
               type: 'line',
               x0: 0.5,
               y0: 0.5,
               x1: x,
               y1: y,
               line: {
                 color: 'black',
                 width: 4
               }
             }],
           title: 'Belly Button Washing Frequency (Scrubs per week)',
           xaxis: {visible: false, range: [-1, 1]},
           yaxis: {visible: false, range: [-1, 1]}
         };
         var data = [traceGauge];
         console.log(data);
         Plotly.newPlot("gauge", data, layout, {staticPlot: true});
        })
      }

  function buildCharts(sample) {
  
    // @TODO: Use `d3.json` to fetch the sample data for the plots
    // HINT: You will need to use slice() to grab the top 10 sample_values,
      // otu_ids, and labels (10 each).
      
    var sample_pie = d3.select("#pie").html("");
    var sample_pie_url = `/samples/${sample}`;
    d3.json(sample_pie_url).then((sample_pie_data => {
        console.log(sample_pie_data);
  
    sample_pie_data.sample_values.forEach((pie_values =>parseInt(pie_values)));
      
    let otu_ids_list = sample_pie_data["otu_ids"];
    let otu_labels_list = sample_pie_data["otu_labels"];
    let sample_values_list = sample_pie_data["sample_values"];

    var combined_list = [sample_values_list,otu_labels_list,otu_ids_list];
      
    var new_pie_data = combined_list[0].map(function(col, i){
        return combined_list.map(function(row){
            return row[i];
        });
      });

      new_pie_data.sort(function(a, b){
        return b[0] - a[0];
        });
      
      var top_ten_pie_data = new_pie_data.slice(0,10);
      
      var pie_data = top_ten_pie_data[0].map(function(col, i){
        return top_ten_pie_data.map(function(row){
            return row[i];
        });
      });
      console.log(pie_data);

      // @TODO: Build a Pie Chart
      var data = [{
        values: pie_data[0],
        labels: pie_data[2],
        hovertext: pie_data[1],
        hoverinfo: 'hovertext',
        type: 'pie'
      }];
      
      var layout = {
        height: 510,
        width: 500
      };
      
      console.log(data);
      Plotly.newPlot('pie', data, layout);

  
      // @TODO: Build a Bubble Chart using the sample data
  
      var bubble_data = [{
        x: otu_ids_list,
        y: sample_values_list,
        text: otu_labels_list,
        mode: "markers",
        marker: {
          size: sample_values_list,
          color: otu_ids_list,
          colorscale:"Rainbow"
        }
      }];
      
      var layout = {
        showlegend: false,
        height: 600,
        width: 1200,
        sizemode: "area",
        hovermode:"closet",
        xaxis:{title:"OTU_ID"}
      };
      
      Plotly.newPlot('bubble', bubble_data, layout);
      
    }));
  }

  function init() {
    // Grab a reference to the dropdown select element
    var selector = d3.select("#selDataset");
  
    // Use the list of sample names to populate the select options
    d3.json("/names").then((sampleNames) => {
      sampleNames.forEach((sample) => {
        selector
          .append("option")
          .text(sample)
          .property("value", sample);
      });
  
      // Use the first sample from the list to build the initial plots
      const firstSample = sampleNames[0];
      buildCharts(firstSample);
      buildMetadata(firstSample);
    });
  }
  
  function optionChanged(newSample) {
    // Fetch new data each time a new sample is selected
    buildCharts(newSample);
    buildMetadata(newSample);
  }
  
  // Initialize the dashboard
  init();
  