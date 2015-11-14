var MapEditor = function(){
  this.setup();
  this.current_color = undefined;
  this.all_colors = {};
}
MapEditor.prototype.resetToolset = function (){
  $(".tools").removeClass("activated");
  $("#toolset").show();
}
MapEditor.prototype.generateCanvas = function(){
  var resolution = Utils.convertToInt($("#tile-resolution").val());
  var num_columns = Utils.convertToInt($('#canvas-num-cols').val());
  var num_rows = Utils.convertToInt($('#canvas-num-rows').val());  
  this.canvas = new Canvas("canvas", resolution, num_columns, num_rows);
  this.canvas.draw();
  this.resetToolset();
  this.setupTileClickHandler();
  this.toggleGridlines($("#gridlines"));
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
MapEditor.prototype.setupToolset = function(){
  $("#eraser").data("mode", Canvas.ERASER);
  $("#dropper").data("mode", Canvas.DROPPER);
}
MapEditor.prototype.setup = function(){
  var canvas = undefined;
  var the_editor = this;
  this.setupToolset();
  this.getPaletteImages();
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
  tile.setColor(this.current_color);
  tile.draw();
}

MapEditor.prototype.eraseTileColor = function(tile){
  tile.unsetColor();
  tile.draw();
}

MapEditor.prototype.getTileColor = function(tile){
  if (tile.color === undefined){
    return;
  }
  var color = this.all_colors[tile.color];
  this.setCurrentColor(color.$element);
  $("#dropper").click();
}

MapEditor.prototype.setCurrentColor = function($paint_btn){
  $(".tools-paint").removeClass("activated");
  $paint_btn.addClass("activated");
  this.current_color = (new Color($paint_btn)).src;
}

MapEditor.prototype.getPaletteImages = function(){
  var dir = "images/";
  var ext = ".png";
  var the_editor = this;
  $.ajax({
    url: dir,
    success: function(data){
      $(data).find("a:contains(" + ext + ")").each(
        function(){
          var filename = this.href.replace(window.location.host, "").replace("http://", "");
          var src = filename.substr(1);
          var $btn = $("<button class='tools tools-paint'><img src='" + src + "'></button>");
          $("#palette").append($btn);
          var color = new Color($btn);
          the_editor.all_colors[color.src] = color;
        });
      $(".tools-paint").click(
        function(){
          the_editor.setCurrentColor($(this));
        });
    }
  });
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
