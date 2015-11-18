var MapLoader = function(editor){
  this.file_reader = new FileReader();
  this.setupFileReader();
  this.editor = editor;
}
MapLoader.prototype.setupFileReader = function(){
  var the_loader = this;
  this.file_reader.onloadend = function(e){
    var file = e.target.result;
    the_loader.parseMapDataAndGenerateMap(file);
  }
}
MapLoader.prototype.getTileDataOutput = function(tile){
  var loc = { x: tile.x, y: tile.y, map: tile.map};
  var portal = {};
  var portal_x = Utils.convertToInt(tile.portal_x);
  var portal_y = Utils.convertToInt(tile.portal_y);
  var portal_map = Utils.convertToInt(tile.portal_map);
  if (portal_x !== -1 &&
      portal_y !==  -1 &&
      portal_map !== -1 ){
    portal.x = portal_x;
    portal.y = portal_y;
    portal.map = portal_map
  } 
  return {
    loc:            loc,
    portal:         portal,
    is_accessible:  tile.is_accessible,
    graphic:        tile.color,
    messages:       tile.messages
  };
}
MapLoader.prototype.getMapDataOutput = function(){
  var meta = this.editor.getCanvasMetaData();
  output = { meta:{}, tiles:[]};
  output.meta.resolution = meta.resolution;
  output.meta.num_columns = meta.num_columns;
  output.meta.num_rows = meta.num_rows;
  output.meta.map_id = meta.map_id;
  for (var r=0; r<meta.num_rows; r++){
    for (var c=0; c<meta.num_columns; c++){
      var tile = this.editor.getCanvasTile(c, r);
      if (tile.color !== undefined){
        output.tiles.push( this.getTileDataOutput(tile) );   
      }
    }
  }
  var output_str = "data:application/json;charset=utf-8," + JSON.stringify(output);
  return output_str;
}
MapLoader.prototype.parseTileData = function(tile_data){
  var x = Utils.convertToInt(tile_data.loc.x);
  var y = Utils.convertToInt(tile_data.loc.y);
  var tile = this.editor.getCanvasTile(x, y);
  if (tile !== undefined){
    tile.setColor(tile_data.graphic);
    tile.is_accessible = tile_data.is_accessible;
    tile.messages = tile_data.messages;
    var map = Utils.convertToInt(tile_data.loc.map);
    var portal_map = Utils.convertToInt(tile_data.portal.map);
    var portal_x = Utils.convertToInt(tile_data.portal.x);
    var portal_y = Utils.convertToInt(tile_data.portal.y);
    tile.map = map === -1 ? "" : map;
    tile.portal_map = portal_map === -1 ? "" : portal_map;
    tile.portal_x = portal_x === -1 ? "" : portal_x;
    tile.portal_y = portal_y === -1 ? "" : portal_y;
  }
}
MapLoader.prototype.parseMetaData = function(data){
  if (data === undefined || data.meta === undefined){
    return;
  }
  var res = Utils.convertToInt(data.meta.resolution);
  var cols = Utils.convertToInt(data.meta.num_columns);
  var rows = Utils.convertToInt(data.meta.num_rows);
  var map = Utils.convertToInt(data.meta.map_id);
  if (res === -1 || cols === -1 || rows === -1 || map === -1){
    return;
  }
  return {resolution: res, num_columns: cols, num_rows: rows, map_id: map};
}
MapLoader.prototype.loadMapData = function(file){
  this.file_reader.readAsText(file);
}
MapLoader.prototype.parseMapDataAndGenerateMap = function(file){
  var data = JSON.parse(file);
  var meta = this.parseMetaData(data);
  if (meta === undefined){
    return;
  }
  this.editor.generateCanvas(meta.resolution, meta.num_columns, meta.num_rows, meta.map_id);
  for (var i=0; i<data.tiles.length; i++){
    this.parseTileData(data.tiles[i]);
  }
  this.editor.drawCanvas();
}

