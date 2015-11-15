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
MapLoader.prototype.parseTileRow = function(row){
  if (row.length !== 3){
    return;
  }
  var x = Utils.convertToInt(row[0]);
  var y = Utils.convertToInt(row[1]);
  var src = row[2];
  var tile = this.editor.getCanvasTile(x, y);
  if (tile !== undefined){
    tile.setColor(src);
  }
}
MapLoader.prototype.parseMetaDataRow = function(row){
  if (row === undefined || row.length !== 3){
    return;
  }
  var res = Utils.convertToInt(row[0]);
  var cols = Utils.convertToInt(row[1]);
  var rows = Utils.convertToInt(row[2]);
  if (res === -1 || cols === -1 || rows === -1){
    return;
  }
  return {resolution: res, num_columns: cols, num_rows: rows};
}
MapLoader.prototype.loadMapData = function(file){
  this.file_reader.readAsText(file);
}
MapLoader.prototype.parseMapDataAndGenerateMap = function(file){
  var data = Utils.csvToArray(file);
  var meta = this.parseMetaDataRow(data[0]);
  if (meta === undefined){
    return;
  }
  this.editor.generateCanvas(meta.resolution, meta.num_columns, meta.num_rows);
  for (var i=1; i<data.length; i++){
    this.parseTileRow(data[i]);
  }
  this.editor.drawCanvas();
}

