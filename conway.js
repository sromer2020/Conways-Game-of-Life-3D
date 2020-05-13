//==================================================================================================================================================
//Stephen Romer, Andrew Kuczma, Jacob Cayetano
//Created: 04-20-2020
//Last Updated: 05-12-2020
//Conway's Game of Life in .JS
//It's life! Uses nearest neighbor calculation to create a Conway's Game of Life simulation. (WORKING)
//Attempt to render visuals in 3D using three.js Graphics Library on a grid in browser (WORKING)

//PROGRAMMER'S NOTES:
//JAVASCRIPT DOES NOT ALLOW FOR MULTIDIMENTSIONAL ARRAYS, MUST CREATE A NEW ARRAY LOCATION IN EACH ARRAY SPOT (each row has it's own array)
//THREE.JS IS OUR BROWSER RENDERER FOR VISUALS, FOCUS ON GETTING THE ALG UP FIRST, THEN RENDERING.
//==================================================================================================================================================


//Three.js Section of the code (VISUALIZATION)
//=====================================================================================================================
//Rendering initialization and window situations
var renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//Camera creation and initial perspective
var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
camera.position.set(0, 11, 11);    //best view atm
camera.lookAt(0, 0, 0);

//Scene creation
var scene = new THREE.Scene();

//Light(s)
var pointLight = new THREE.PointLight(0xffffff,0.75,0);
pointLight.position.set(10,100,100);

//Grid creation (10x10)
var gridHelper = new THREE.GridHelper(10, 10);

scene.add(gridHelper, pointLight);

//Creation of Spheres for Each Object in Array (Jacob)
for(var j=0; j<10; j++) // rows
{
    for (var i = 0; i<10; i++) // columns
    {
        eval('var geometry' + (i+(j*10)) + ' = new THREE.SphereBufferGeometry(0.5,32,32);');
        // Use if want to make different materials
        //eval('var material' + (i+(j*10)) + ' = new THREE.MeshPhongMaterial({color: 0xffffff});');
        var material = new THREE.MeshPhongMaterial({color: 0xffffff});
        eval('var s' + (i+(j*10)) + ' = new THREE.Mesh(geometry' + (i+(j*10)) + ',material);');
        eval('s' + (i+(j*10)) + '.position.set(' + (-4.5+i) + ',0,' + (-4.5+j) + ');');
        eval('scene.add(s' + (i+(j*10)) + ');');
    }
}

var controls = new THREE.OrbitControls(camera, renderer.domElement);

//controls.update() must be called after any manual changes to the camera's transform
renderer.render(scene, camera);
animate();
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
// rerender function (animation use)
var render = function(){
    requestAnimationFrame(render); // Lets browser know that it needs to listen for render updates
    renderer.render(scene,camera); // creation of world
    //animate();
};

// Resizes based on browser size (keeps everything in frame)
window.addEventListener('resize',onWindowResize,false);
function onWindowResize(){
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();                            // executes window resize after changes detected
    renderer.setSize(window.innerWidth,window.innerHeight);
};

//======================================================================================================================


//Main Code for Conway's Game of Life logic (DO NOT TOUCH IT IS PERFECT IN CURRENT 10x10)
//======================================================================================================================
//Take parameters (rows, cols) and creates empty grid
function createEmptyGrid(rows, cols)
{
    var grid = [];  //overall grid skeleton, empty grid.

    for(var i=0; i<rows; i++)
    {
        grid[i] = new Array(cols);    //creates new empty array for the row
    };
    return grid;    //returns empty grid
};

//Take parameters (rows, cols) and populates grid according to that size w/ either 1's or 0's.
function createFilledGrid(rows, cols)
{
    var grid = [];  //overall grid skeleton, empty grid.

    for(var i=0; i<rows; i++)
    {
        grid[i] = new Array(cols);    //creates new array for the row

        for(var j=0; j<cols; j++)
        {
            grid[i][j] = Math.round(Math.random(1));    //randomly selects 1 or 0
        };
    };
    return grid;    //returns populated grid
};

//Based on the grid passed, uses nearest neighbor calculation to return the updated grid. (CREATES NEXT GENERATION BASED ON CONWAY'S RULES)
function calculateNN(grid, rows, cols)
{
    //Nested Function to Count the neighbors of the current position
    function countNeighbors(grid, x, y)
    {
        let totalNeighbors = 0;

        //Loops through the area of the current location
        for(var i = -1; i <= 1; i++)
        {
            for(var j = -1; j <= 1; j++)
            {
                let rows = (x + i + 10) % 10
                let cols = (y + j + 10) % 10
                totalNeighbors += grid[rows][cols];
            }
        }
        //Don't want to double count the cell whose neighbors were being counted.
        totalNeighbors -= grid[x][y];       //grid[x][y] is the current location
        return totalNeighbors;
    }

    //Creates empty array for the next gen
    let nextGen = createEmptyGrid(rows, cols);

    for(var i=0; i < rows; i++)
    {
        for(var j=0; j < cols; j++)
        {
            let currentState = grid[i][j];

            //CHECKS TO SEE IF SPOT IS AN EDGE OR NOT

            //Counts Neighbors by calling the nested function
            let neighbors = countNeighbors(grid, i, j);

            //RULES FOR CONWAY'S GAME OF LIFE
            if(currentState == 0 && neighbors == 3)
            {
                nextGen[i][j] = 1;    //ALIVE
            }
            else if(currentState == 1 && (neighbors < 2 || neighbors > 3))
            {
                nextGen[i][j] = 0;    //DEAD
            }
            else
            {
                nextGen[i][j] = currentState;    //NO CHANGE
            }
        }
    }

    var updatedGrid = nextGen;
    return updatedGrid;
}

//Cycles through the grid and prints each row.
function drawGrid(grid)
{
    //a)
    for(var i=0; i<grid.length; i++)
    {
        console.log(grid[i]);
        //document.write(grid[i] + "<br>")    //writes each grid row to htnl doc (depreceated)
    };
};

var rows = 10;
var cols = 10;
let startGrid = createFilledGrid(rows, cols);
let nextGrid = createEmptyGrid(rows, cols);
//======================================================================================================================
//Master function to initialize game actors and gameplay loop. (MUST BE TWEAKED CURRENTLY HANGS)
function startGame()
{
    //Test area for grid creation (WORKS! Cuts part of gird off sometimes?
    //empty grid for later calculation
    drawGrid(startGrid);
    console.table(startGrid);
    for(var i=0; i<rows; i++)
    {
        for(var j=0; j<cols; j++)
        {
            if (startGrid[i][j] == 1)
            {
                eval('s' + (j+(i*10)) + '.visible = true;');
            }
            else
            {
                eval('s' + (j+(i*10)) + '.visible = false;');
            }
        }
    }
}

//Processes each new generation and renders each to scene
function step()
{
    //let i = 0;
    //var delayInMilliseconds = 1000; //1 second
    nextGrid = calculateNN(startGrid, rows, cols);
    startGrid = nextGrid;
    console.log("Generation: " + i);
    console.table(nextGrid);
    for(var i=0; i<rows; i++)
    {
        for(var j=0; j<cols; j++)
        {
            if (nextGrid[i][j] == 1)
            {
                eval('s' + ((i*10)+j) + '.visible = true;');
            }
            else
            {
                eval('s' + ((i*10)+j) + '.visible = false;');
            }
        }
    }
    render();
    i++;
}

//Initialization of game
window.onload = function() {startGame()} ;   //MUST BE REMOVED IF TESTING IN .VS