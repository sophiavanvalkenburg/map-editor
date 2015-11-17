var MapEditor = function(){
  this.current_color = undefined;
  this.selected_tile = undefined;
  this.all_colors = {};
  this.multi_placement_on = false;
  this.map_loader = new MapLoader(this);
  this.setup();
}
MapEditor.DRAW = "draw";
MapEditor.ERASER = "eraser";
MapEditor.DROPPER = "dropper";
MapEditor.INFO = "info";
MapEditor.NONE = "none";
MapEditor.prototype.resetToolset = function (){
  $(".tools").removeClass("activated");
  $("#toolset").show();
}
MapEditor.prototype.generateCanvas = function(resolution, num_cols, num_rows){
  this.canvas = new Canvas("canvas", resolution, num_cols, num_rows);
  this.drawCanvas();
}
MapEditor.prototype.drawCanvas = function(){
  this.canvas.draw();
  this.setupTileActionHandler();
  this.resetToolset();
  this.toggleGridlines($("#gridlines"));
}
MapEditor.prototype.getCanvasTile = function(x, y){
  return this.canvas.getTile(x, y);
}
MapEditor.prototype.getCanvasMetaData = function(){
  return {
    resolution: this.canvas.resolution,
    num_columns: this.canvas.num_columns,
    num_rows: this.canvas.num_rows
  };
}
MapEditor.prototype.setupTileActionHandler = function(){
  var the_editor = this;
  $(".tile").click(
    function(){
      var tile = the_editor.getCanvasTile($(this).data("x"), $(this).data("y"));
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
        case MapEditor.INFO:
          the_editor.openInfoMode(tile);
          break;
      }
    });
  $(".tile").mouseover(
    function(){
      if (the_editor.multi_placement_on){
        var tile = the_editor.getCanvasTile($(this).data("x"), $(this).data("y"));
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
  var clicked_mode = $clicked_tool.data("mode");
  if ($clicked_tool.hasClass("activated")){
    $clicked_tool.removeClass("activated");
    this.canvas.setMode(MapEditor.NONE);
    this.unsetCurrentColor();
    this.unsetInfoMode();
  }else{
    this.unsetInfoMode();
    $(".tools-draw").removeClass("activated");
    $clicked_tool.addClass("activated");
    if ($clicked_tool.hasClass("tools-paint")){
      this.setCurrentColor($clicked_tool);
    }
    this.canvas.setMode(clicked_mode);
  }
}

MapEditor.prototype.unsetInfoMode = function(){

  $("#tile-info-box").hide();
  $("#canvas td").removeClass("highlighted");
  this.selected_tile = undefined;
  $("#tile-info-map").val("");
  $("#tile-info-x").val("");
  $("#tile-info-y").val("");
  $("#tile-info-portal-map").val("");
  $("#tile-info-portal-x").val("");
  $("#tile-info-portal-y").val("");
  $("#tile-info-graphic").text("");
  $("#tile-info-accessible").prop("checked", false);
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
  var output = this.map_loader.getMapDataOutput();
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
  $("#info").data("mode", MapEditor.INFO);
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
  $("#save-info-box").click(
      function(){
        the_editor.saveTileInfo();
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
  color.$element.click();
}

MapEditor.prototype.openInfoMode = function(tile){
  this.selected_tile = tile;
  $("#tile-info-box").show();
  this.populateTileInfoBox(tile);
  $("#canvas td").removeClass("highlighted");
  tile.$element.addClass("highlighted");
}

MapEditor.prototype.populateTileInfoBox = function(tile){
  $("#tile-info-map").val(tile.map);
  $("#tile-info-x").val(tile.x);
  $("#tile-info-y").val(tile.y);
  $("#tile-info-portal-map").val(tile.portal_map);
  $("#tile-info-portal-x").val(tile.portal_x);
  $("#tile-info-portal-y").val(tile.portal_y);
  $("#tile-info-graphic").text(tile.color);
  $("#tile-info-accessible").prop("checked", tile.is_accessible);
}

MapEditor.prototype.saveTileInfo = function(){
  if (this.selected_tile === undefined){
    return;
  }
  this.selected_tile.portal_map = $("#tile-info-portal-map").val();
  this.selected_tile.portal_x = $("#tile-info-portal-x").val();
  this.selected_tile.portal_y = $("#tile-info-portal-y").val();
  this.selected_tile.is_accessible = $("#tile-info-accessible").prop("checked");
  $("#saved-info-indicator").show();
  window.setTimeout( function(){ $("#saved-info-indicator").hide();}, 1000);
}

MapEditor.prototype.unsetCurrentColor = function(){
  this.current_color = undefined;
}

MapEditor.prototype.setCurrentColor = function($paint_btn){
  $(".tools-paint").removeClass("activated");
  $paint_btn.addClass("activated");
  this.current_color = (new Color($paint_btn)).src;
}

MapEditor.prototype.addImageToPalette = function(img){
  var filename = img.href.replace(window.location.host, "").replace("http://", "");
  var $btn = this.createPaletteImageButton(filename.substr(1));
  $("#palette").append($btn);
  var color = new Color($btn);
  this.all_colors[color.src] = color;
}
MapEditor.prototype.createPaletteImageButton = function(src){
  var $image_btn = $("<button class='tools tools-draw tools-paint'><img src='" + src + "'></button>");
  $image_btn.data("mode", MapEditor.DRAW);
  var the_editor = this;
  $image_btn.click(
    function(){
      the_editor.changeModes($(this))
    });
  return $image_btn
}
MapEditor.prototype.getPaletteImages = function(){
  var dir = "images/";
  var ext = ".png";
  var palette_error_msg = "Unable to load palette images";
  var the_editor = this;
  $.ajax({
    url: dir,
    error: function(){
      $("#palette p").html(palette_error_msg).show();
    },
    success: function(data){
      var images = $(data).find("a:contains(" + ext + ")")
      if (images.length === 0){
        $("#palette p").html(palette_error_msg).show();
      }else{
        for (var i=0; i<images.length; i++){
          the_editor.addImageToPalette(images[i]);
        }
      }
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
