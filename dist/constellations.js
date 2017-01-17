var setLines = function(){

    var self = this;

    this.canvas = document.querySelector('canvas');

    var ctx = this.canvas.getContext('2d'),
        color = 'rgba(255,255,255,0.8)';
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvas.style.display = 'block';
    ctx.fillStyle = color;
    ctx.lineWidth = 0.1;
    ctx.strokeStyle = color;


    this.resize = function(){
        self.canvas.width = window.innerWidth;
        self.canvas.height = window.innerHeight;
        ctx.fillStyle = color;
        ctx.lineWidth = 0.1;
        ctx.strokeStyle = color;
    };

    $(window).on('resize', self.resize);

    var mousePosition = {
        x: 30 * self.canvas.width / 100,
        y: 30 * self.canvas.height / 100
    };

    var particles = {
        count: 220,
        maxDistance: 105,
        mouseRadius: 160,
        array: []
    };

    function Particle(){
        this.x = Math.random() * self.canvas.width;
        this.y = Math.random() * self.canvas.height;

        this.vx = -0.0675 + (Math.random() * 0.125);
        this.vy = -0.0675 + (Math.random() * 0.125);

        this.radius = Math.random();

        this.create = function() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            ctx.fill();
        };
    }

    Particle.animate = function() {

        var i, particle;

         for(i = 0; i < particles.count; i++){
                particle = particles.array[i];

            if(particle.y < 0 || particle.y > self.canvas.height){
                particle.vx = particle.vx;
                particle.vy = -1 * particle.vy;
            }
            else if(particle.x < 0 || particle.x > self.canvas.width){
                particle.vx = -1 * particle.vx;
                particle.vy = particle.vy;
            }
            particle.x += particle.vx;
            particle.y += particle.vy;
        }
    };

    Particle.line = function() {

        function checkMouseRadius(particle) {
            if (Math.abs(particle.x - mousePosition.x) < particles.mouseRadius && Math.abs(particle.y - mousePosition.y) < particles.mouseRadius) {
                return true;
            }
        }

        function checkParticleDistance(particle, otherParticle) {
            if (Math.abs(particle.x - otherParticle.x) < particles.maxDistance && Math.abs(particle.y - otherParticle.y) < particles.maxDistance) {
                return true;
            }
        }

        var i, c, particle, otherParticle;

        for(i = 0; i < particles.count; i++){
            for(c = 0; c < particles.count; c++){
                particle = particles.array[i];
                otherParticle = particles.array[c];

                if(checkMouseRadius(particle)){
                    if(checkParticleDistance(particle, otherParticle)){
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(otherParticle.x, otherParticle.y);
                        ctx.stroke();
                        ctx.closePath();
                    }
                }
            }
        }
    };

    function createParticles(){

        var i;

        ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);

        if (particles.array.length < 1) {
            for (i = 0; i < particles.count; i++){
                particles.array.push(new Particle());
            }
        }

        for (i = 0; i < particles.count; i++){
            var particle = particles.array[i];
            particle.create();
        }

        Particle.line();
        Particle.animate();

        window.requestAnimationFrame(createParticles);
    }

    $('#page').on('mousemove mouseleave', function(event){
        if(event.type == 'mousemove'){
            mousePosition.x = event.pageX;
            mousePosition.y = event.pageY;
        }
        if(event.type == 'mouseleave'){
            mousePosition.x = self.canvas.width / 2;
            mousePosition.y = self.canvas.height / 2;
        }
    });
        
    this.interval = createParticles();   

};

var lines = new setLines();

$(window).load(function(event) {
    lines.interval;
});





