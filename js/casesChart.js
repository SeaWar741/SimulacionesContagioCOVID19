var ctx2 = document.getElementById('myChart').getContext('2d');
    var chart = new Chart(ctx2, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: [],
            datasets: [{
                label: 'My First dataset',
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: []
            }]
        },

        // Configuration options go here
        options: {}
});

var dataset = [1, 10, 68, 82, 90, 97, 98, 99, 99];
for (var i = 0; i < dataset.length; i++) {
    addData(chart2, "-", dataset[i]);
}

function addData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
    chart.update();
}