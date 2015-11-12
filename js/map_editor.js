var Tile = function(x, y, resolution){
  this.x = x;
  this.y = y;
  this.color = "#000000";
  this.resolution = resolution;
  this.$element = undefined;
};
Tile.prototype.unsetColor = function(){
  this.color = "#000000";
}
Tile.prototype.setColor = function(color){
  this.color = color;
};
Tile.prototype.draw = function(){
  this.$element.css("width", this.resolution);
  this.$element.css("height", this.resolution);
  this.$element.css("background-color", this.color);
  this.$element.data("x", this.x);
  this.$element.data("y", this.y);
}
Tile.prototype.setElement = function($element){
  this.$element = $element;
}


var Canvas = function(id, resolution, num_columns, num_rows){
  this.id = id;
  this.resolution = resolution;
  this.num_columns = num_columns;
  this.num_rows = num_rows;
  this.tile_grid = [];
  this.generateTileGrid();
  this.mode = Canvas.DRAW;
}
Canvas.DRAW = "draw";
Canvas.ERASER = "eraser";
Canvas.DROPPER = "dropper"
Canvas.prototype.getMode = function(){
  return this.mode;
}
Canvas.prototype.setMode = function(mode){
  this.mode = mode;
}
Canvas.prototype.getTile = function(x, y){
  if (this.tile_grid[y] !== undefined){
    return this.tile_grid[y][x];
  }
}
Canvas.prototype.generateTileGrid = function(){
 for (var r=0; r<this.num_rows; r++){
    this.tile_grid[r] = [];
    for (var c=0; c<this.num_columns; c++){
      var tile = new Tile(c, r, this.resolution);
      this.tile_grid[r].push(tile);
    }
  }
}
Canvas.prototype.clear = function(){
  $("#"+this.id).html("");
}
Canvas.prototype.draw = function(){
  this.clear();
  var $table = $("<table>");
  for (var r=0; r<this.num_rows; r++){
    var $row = $("<tr>");
    for (var c=0; c<this.num_columns; c++){
      var $cell = $("<td>");
      $cell.addClass("tile");
      var tile = this.getTile(c, r);
      tile.setElement($cell);
      tile.draw();
      $row.append($cell);
    }
    $table.append($row);
  }
  $("#"+this.id).append($table);
}
Canvas.prototype.tileGridOutput = function(){
  var output = "data:text/csv;charset=utf-8,";
  for (var r=0; r<this.num_rows; r++){
    for (var c=0; c<this.num_columns; c++){
      var tile = this.getTile(c, r);
      output += tile.x+","+tile.y+","+tile.color+"\n";
    }
  }
  return output;
}


function convertToInt(str){
  var new_int = parseInt(str);
  if (isNaN(new_int)){
    console.log("err: " + str + " is not a number");
    return 0;
  }
  return new_int;
}

function setTileColor(tile){
  var current_color = $("#palette .picker").spectrum("get").toHexString();
  tile.setColor(current_color);
  tile.draw();
}

function eraseTileColor(tile){
  tile.unsetColor();
  tile.draw();
}

function getTileColor(tile){
  $("#palette .picker").spectrum("set", tile.color);
  $("#dropper").click();
}

$(function(){
  var canvas = undefined;
  $('#generate-canvas-btn').click(
    function(){
      var resolution = convertToInt($("#tile-resolution").val());
      var num_columns = convertToInt($('#canvas-num-cols').val());
      var num_rows = convertToInt($('#canvas-num-rows').val());  
      canvas = new Canvas("canvas", resolution, num_columns, num_rows);
      canvas.draw();
      $("#palette").show();
      $(".tile").click(
        function(){
          var tile = canvas.getTile($(this).data("x"), $(this).data("y"));
          switch(canvas.getMode()){
            case Canvas.DRAW:
              setTileColor(tile);
              break;
            case Canvas.ERASER:
              eraseTileColor(tile);
              break;
            case Canvas.DROPPER:
              getTileColor(tile);
              break;
          }
        });
    });
  $("#palette .picker").spectrum({
    color: "#f00",
    });
  $("#eraser").data("mode", Canvas.ERASER);
  $("#dropper").data("mode", Canvas.DROPPER);
  $(".tools-draw").click(
    function(){
      var canvas_mode = canvas.getMode();
      var this_mode = $(this).data("mode");
      if (canvas_mode === this_mode){
        canvas.setMode(Canvas.DRAW);
        $(this).removeClass("activated");
      }else{
        $(".tools-draw").removeClass("activated");
        $(this).addClass("activated");
        canvas.setMode(this_mode);
      }
    });
  $("#gridlines").click(
    function(){
      $(this).toggleClass("activated");
      if ($(this).hasClass("activated")){
        $("#canvas td").addClass("show-gridlines");
      }else{
        $("#canvas td").removeClass("show-gridlines");
      }
    });
  $("#save").click(
    function(){
      var output = canvas.tileGridOutput();
      var encoded_uri = encodeURI(output);
      window.open(encoded_uri);
    });
});
