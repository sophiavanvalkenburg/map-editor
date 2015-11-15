var MapEditor = function(){
  this.current_color = undefined;
  this.all_colors = {};
  this.multi_placement_on = false;
  this.map_loader = new MapLoader(this);
  this.setup();
}
MapEditor.DRAW = "draw";
MapEditor.ERASER = "eraser";
MapEditor.DROPPER = "dropper"
MapEditor.prototype.resetToolset = function (){
  $(".tools").removeClass("activated");
  $("#toolset").show();
}
MapEditor.prototype.generateCanvas = function(resolution, num_cols, num_rows){
  this.canvas = new Canvas("canvas", resolution, num_cols, num_rows);
  this.canvas.draw();
  this.resetToolset();
  this.setupTileActionHandler();
  this.toggleGridlines($("#gridlines"));
}
MapEditor.prototype.setupTileActionHandler = function(){
  var the_editor = this;
  $(".tile").click(
    function(){
      var tile = the_editor.canvas.getTile($(this).data("x"), $(this).data("y"));
      switch(the_editor.canvas.getMode()){
        case MapEditor.DRAW:
          the_editor.setTileColor(tile);
          break;
        case MapEditor.ERASER:
          the_editor.eraseTileColor(tile);
          break;
        case MapEditor.DROPPER:
          the_editor.getTileColor(tile);
          break;
      }
    });
  $(".tile").mouseover(
    function(){
      if (the_editor.multi_placement_on){
        var tile = the_editor.canvas.getTile($(this).data("x"), $(this).data("y"));
        switch(the_editor.canvas.getMode()){
          case MapEditor.DRAW:
            the_editor.setTileColor(tile);
            break;
          case MapEditor.ERASER:
            the_editor.eraseTileColor(tile);
            break;
        }
      }
    });
}
MapEditor.prototype.changeModes = function($clicked_tool){
  var canvas_mode = this.canvas.getMode();
  var clicked_mode = $clicked_tool.data("mode");
  if (canvas_mode === clicked_mode){
    this.canvas.setMode(MapEditor.DRAW);
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
MapEditor.prototype.openMap = function(file_input){
  var file = file_input.files[0];
  if (file !== undefined){
    $("#open-file-input-label").text(file.name);
    this.map_loader.loadMapData(file);
  }else{
    $("#open-file-input-label").text("");
  }
}
MapEditor.prototype.setupToolset = function(){
  $("#eraser").data("mode", MapEditor.ERASER);
  $("#dropper").data("mode", MapEditor.DROPPER);
}
MapEditor.prototype.unsetOpenMapInput = function(){
  $("#open-file-input").val("");
  $("#open-file-input").change();
}
MapEditor.prototype.setup = function(){
  var canvas = undefined;
  var the_editor = this;
  this.setupToolset();
  this.getPaletteImages();
  $('#generate-canvas-btn').click(
    function() {
      the_editor.unsetOpenMapInput();
      var resolution = Utils.convertToInt($("#tile-resolution").val());
      var num_columns = Utils.convertToInt($('#canvas-num-cols').val());
      var num_rows = Utils.convertToInt($('#canvas-num-rows').val());  
      the_editor.generateCanvas(resolution, num_columns, num_rows);
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
  $("#open").click(
    function(){
      $("#open-file-input").click();
    });
  $("#open-file-input").change(
    function(){
      the_editor.openMap(this);
    });
   window.addEventListener("keyup",
    function(e){
      if (e.which === 32){
        the_editor.multi_placement_on = !the_editor.multi_placement_on ;
        var mp_status = the_editor.multi_placement_on ? "Multi-Placement is ON!" : "";
        $("#multi-placement-status").text(mp_status);
      }
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
        return -1;
      }
      return new_int;
    },
  csvToArray:
    function(text){
      var lines_array = [];
      var lines = text.split("\n");
      for (var i=0; i<lines.length; i++){
        var rows = lines[i].split(",");
        lines_array[i] = rows;
      }
      return lines_array;
    }
}

$(function(){
 new MapEditor();
});
