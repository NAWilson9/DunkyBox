/**
 * Created by Nick on 9/18/2015.
 */
var testerino = function(){
    var link = document.getElementById('hype1').value;
    socket.emit('someAddress', link);
};