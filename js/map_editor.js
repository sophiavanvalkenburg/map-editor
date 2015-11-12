var MapEditor = function(){
  this.setup();
}
MapEditor.prototype.generateCanvas = function(){
  var resolution = Utils.convertToInt($("#tile-resolution").val());
  var num_columns = Utils.convertToInt($('#canvas-num-cols').val());
  var num_rows = Utils.convertToInt($('#canvas-num-rows').val());  
  this.canvas = new Canvas("canvas", resolution, num_columns, num_rows);
  this.canvas.draw();
  $("#palette").show();
  this.setupTileClickHandler();
}
MapEditor.prototype.setupTileClickHandler = function(){
  var the_editor = this;
  $(".tile").click(
    function(){
      var tile = the_editor.canvas.getTile($(this).data("x"), $(this).data("y"));
      switch(the_editor.canvas.getMode()){
        case Canvas.DRAW:
          the_editor.setTileColor(tile);
          break;
        case Canvas.ERASER:
          the_editor.eraseTileColor(tile);
          break;
        case Canvas.DROPPER:
          the_editor.getTileColor(tile);
          break;
      }
    });
}
MapEditor.prototype.changeModes = function($clicked_tool){
  var canvas_mode = this.canvas.getMode();
  var clicked_mode = $clicked_tool.data("mode");
  if (canvas_mode === clicked_mode){
    this.canvas.setMode(Canvas.DRAW);
    $clicked_tool.removeClass("activated");
  }else{
    $(".tools-draw").removeClass("activated");
    $clicked_tool.addClass("activated");
    this.canvas.setMode(clicked_mode);
  }
}
MapEditor.prototype.toggleGridlines = function($clicked_tool){
  $clicked_tool.toggleClass("activated");
  if ($clicked_tool.hasClass("activated")){
    $("#canvas td").addClass("show-gridlines");
  }else{
    $("#canvas td").removeClass("show-gridlines");
  }
}
MapEditor.prototype.saveMap = function(){
  var output = this.canvas.tileGridOutput();
  var encoded_uri = encodeURI(output);
  window.open(encoded_uri);
}
MapEditor.prototype.setupPalette = function(){
 $("#palette .picker").spectrum({
    color: "#f00",
    });
  $("#eraser").data("mode", Canvas.ERASER);
  $("#dropper").data("mode", Canvas.DROPPER);
}
MapEditor.prototype.setup = function(){
  var canvas = undefined;
  var the_editor = this;
  this.setupPalette();
  $('#generate-canvas-btn').click(
    function() {
      the_editor.generateCanvas();
    });
  $(".tools-draw").click(
    function(){
      the_editor.changeModes($(this));
    });
  $("#gridlines").click(
    function(){
      the_editor.toggleGridlines($(this))
    });
  $("#save").click(
    function(){
      the_editor.saveMap();
    });
}

MapEditor.prototype.setTileColor = function(tile){
  var current_color = $("#palette .picker").spectrum("get").toHexString();
  tile.setColor(current_color);
  tile.draw();
}

MapEditor.prototype.eraseTileColor = function(tile){
  tile.unsetColor();
  tile.draw();
}

MapEditor.prototype.getTileColor = function(tile){
  $("#palette .picker").spectrum("set", tile.color);
  $("#dropper").click();
}


var Utils = {
  convertToInt: 
    function(str){
      var new_int = parseInt(str);
      if (isNaN(new_int)){
        console.log("err: " + str + " is not a number");
        return 0;
      }
      return new_int;
    }
}

$(function(){
 new MapEditor();
});
