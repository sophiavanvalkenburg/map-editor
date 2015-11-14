var Color = function($element){
  this.$element = $element;
  this.src = $element.find("img").attr("src");
}

var Tile = function(x, y, resolution){
  this.x = x;
  this.y = y;
  this.color = undefined;
  this.resolution = resolution;
  this.$element = undefined;
};
Tile.prototype.unsetColor = function(){
  this.color = undefined;
}
Tile.prototype.setColor = function(color){
  this.color = color;
};
Tile.prototype.draw = function(){
  this.$element.html("");
  this.$element.css("width", this.resolution);
  this.$element.css("height", this.resolution);
  this.$element.data("x", this.x);
  this.$element.data("y", this.y);
  if (this.color !== undefined){
    var $img = $("<img src='" + this.color + "'/>");
    $img.css("width", this.resolution);
    $img.css("height", this.resolution);
    this.$element.append($img);
  }
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

