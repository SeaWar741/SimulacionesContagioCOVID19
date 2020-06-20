/**
 * Bouncing balls
 */

const population = document.getElementById('poblacion');
population.innerHTML = "Población: 100";
const contagios = document.getElementById('contagios');
var count = 0;
var counting = 0;
var timeCount = 0;
var redBalls = 1;
var dataset = [];
var blueBalls = 50;
var canvas = document.getElementById('bouncingBall');
var ctx = canvas.getContext('2d');
resizeCanvas();
var ctx2 = document.getElementById('myChart').getContext('2d');
var chart2 = new Chart(ctx2, {
    // The type of chart we want to create
    type: 'bar',

    // The data for our dataset
    data: {
        labels: [],
        datasets: [{
            label: 'Contagios',
            backgroundColor: "transparent",
            borderColor: 'rgb(81,133,255)',
            type: 'line',
            data: []
        },{
            label: 'Contagios acumulados',
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: []
        }]
    },

    // Configuration options go here
    options: {}
});
var world = new World();
var run = setInterval(world.update, 5);


//setInterval(world.update, 5); // World should update every 5 ms

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

/**
 * Ball model
 */
function Ball(color) {

    const RADIUS = 10;
    const MASS = 5;
    const INIT_SPEED_X = 1;
    const INIT_SPEED_Y = 1;
    //const GRAVITY = 0.07;

    // Initialize
    this.color = color;
    this.mass = MASS;
    this.radius = RADIUS;
    this.x = Math.floor(Math.random() * canvas.width);
    this.y = Math.floor(Math.random() * canvas.height);
    this.nextX = this.x;
    this.nextY = this.y;
    this.speedX = INIT_SPEED_X;
    this.speedY = INIT_SPEED_Y;
    this.collisionCount = 0;

    /**
     * Updates potential next position from speed
     */
    this.update = function () {
        //this.speedY += GRAVITY;
        this.x += this.speedX;
        this.y += this.speedY;
        this.nextX = this.x;
        this.nextY = this.y;

        if(this.color=='grey'){
            ctx.font = "30px Arial";
            ctx.globalCompositeOperation="destination-over"
            ctx.fillText("☣️", this.x-27, this.y+5);
            ctx.fillText("Paciente 0", this.x+10, this.y+5);
        }
    };

    /**
     * Test for collision
     *
     * @param ball
     * @returns {boolean}
     */
    this.collision = function (ball) {
        var collision = false;
        var dx = this.nextX - ball.nextX;
        var dy = this.nextY - ball.nextY;
        var distance = (dx * dx + dy * dy);
        if (distance <= (this.radius + ball.radius) * (this.radius + ball.radius)) {
            collision = true;
        }
        return collision;
    };

    /**
     * Check and update ball position if wall collision
     */
    this.wallCollision = function () {

        // Top
        if (this.nextX - this.radius < 0) {
            this.speedX *= -1;
            this.nextX = this.radius;
        }

        // Right
        else if (this.nextX + this.radius > canvas.width) {
            this.speedX *= -1;
            this.nextX = canvas.width - this.radius;
        }

        // Bottom
        else if (this.nextY + this.radius > canvas.height) {
            this.speedY *= -1;
            this.nextY = canvas.height - this.radius;
        }

        // Left
        else if (this.nextY - this.radius < 0) {
            this.speedY *= -1;
            this.nextY = this.radius;
        }

    };

    /**
     * Draw ball to canvas
     */
    this.draw = function () {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
    };

    /**
     * Updates nextX and nextY when two balls is colliding so that they bounce of each other.
     * @param ball
     */
    this.collide = function (ball) {
        var dx = this.nextX - ball.nextX;
        var dy = this.nextY - ball.nextY;
        var collisionAngle = Math.atan2(dy, dx);

        // Actual speed calculations
        var speed1 = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
        var speed2 = Math.sqrt(ball.speedX * ball.speedX + ball.speedY * ball.speedY);

        // Angles/radians calculations
        var direction1 = Math.atan2(this.speedY, this.speedX);
        var direction2 = Math.atan2(ball.speedY, ball.speedX);

        // "Rotate" angles in preparation for momentum formula
        var rotatedVelocityX1 = speed1 * Math.cos(direction1 - collisionAngle);
        var rotatedVelocityY1 = speed1 * Math.sin(direction1 - collisionAngle);
        var rotatedVelocityX2 = speed2 * Math.cos(direction2 - collisionAngle);
        var rotatedVelocityY2 = speed2 * Math.sin(direction2 - collisionAngle);

        // Conservation of momentum formula (because of rotation, y can be used directly, but x needs some tinkering)
        var finalVelocityX1 = ((this.mass - ball.mass) * rotatedVelocityX1 + (ball.mass + ball.mass) * rotatedVelocityX2) / (this.mass + ball.mass);
        var finalVelocityX2 = ((this.mass + this.mass) * rotatedVelocityX1 + (ball.mass - this.mass) * rotatedVelocityX2) / (this.mass + ball.mass);

        // Rotate back again
        this.speedX = Math.cos(collisionAngle) * finalVelocityX1 + Math.cos(collisionAngle + Math.PI / 2) * rotatedVelocityY1;
        this.speedY = Math.sin(collisionAngle) * finalVelocityX1 + Math.sin(collisionAngle + Math.PI / 2) * rotatedVelocityY1;
        ball.speedX = Math.cos(collisionAngle) * finalVelocityX2 + Math.cos(collisionAngle + Math.PI / 2) * rotatedVelocityY2;
        ball.speedY = Math.sin(collisionAngle) * finalVelocityX2 + Math.sin(collisionAngle + Math.PI / 2) * rotatedVelocityY2;

        // Updates
        this.nextX += this.speedX;
        this.nextY += this.speedY;
        ball.nextX += ball.speedX;
        ball.nextY += ball.speedY; 

        //update data

        //update color and data
        if (this.color == 'red' || this.color == "grey"){
            if(ball.color != 'red'){
                counting++;
                contagios.textContent = 'Contagios : ' + counting;
                ball.color = 'red';
                redBalls++;
            }
        } else if(ball.color == "red" || this.color == "grey"){
            this.color = 'red';
            counting++;
            contagios.textContent = 'Contagios : ' + counting;
            redBalls++;
        }
        
        //update position
        while (this.collision(ball)) {
            this.nextX += this.speedX;
            this.nextY += this.speedY;
            ball.nextX += ball.speedX;
            ball.nextY += ball.speedY;

            console.log("Still collision.");
        }

    };
}

/**
 * World model
 */
function World() {

    const BALL_COUNT = 100;
    //const GRAVITY = 5;

    var balls = [];

    // Create and place balls. Only add if they don't overlap any other
    for (var i = 0; i < BALL_COUNT; i++) {
        var color = i === 1 ? 'grey' : 'rgb(176,196,222)';
        while (true) {
            var tmpBall = new Ball(color);
            if (!isOverlap(tmpBall)) {
                balls.push(tmpBall);
                break;
            }
        }
    }

    /**
     * Check if the specified ball overlaps any other
     * @param ball
     * @returns {boolean}
     */
    function isOverlap(ball) {
        for (var i = 0; i < balls.length; i++) {
            if (ball.collision(balls[i])) {
                return true;
            }
        }
        return false;
    }

    /**
     * All world updates through here
     */
    this.update = function () {
        temp = count;
        resizeCanvas();
        ballCollisions();
        balls.forEach(function (ball) {
            ball.update();
            ball.wallCollision();
        });
        balls.forEach(function (ball) {
            ball.draw();
        });
        timeCount++;
        if (Math.floor(timeCount / 200) > count){
            dataset.push(redBalls);
            count++;
        }
        checkSatus();
        /*
        if(temp<count){
            fillChart();
        }
        */
    };

    /**
     * Check if any ball has collided with any other and if so update appropriately
     */
    function ballCollisions() {
        var ball;
        var testBall;
        for (var i = 0; i < balls.length; i++) {
            ball = balls[i];
            for (var j = i + 1; j < balls.length; j++) {
                testBall = balls[j];
                if (ball.collision(testBall)) {
                    ball.collide(testBall);
                }
            }
            ball.x = ball.nextX;
            ball.y = ball.nextY;
        }
    }

    function checkSatus (){
        if(redBalls == BALL_COUNT){
            fillChart();
            clearInterval(run);
        }
    }
}

function fillChart(){
    for (var i = 0; i < dataset.length; i++) {
        console.log(dataset[i])
        addData(chart2, "-", dataset[i]);
    }
}

function addData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
    chart.update();
}

