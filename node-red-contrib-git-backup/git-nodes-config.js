module.exports = function(RED) {
  function GitNodesCredNode(n) {
    RED.nodes.createNode(this,n);
    this.username = this.credentials.username;
    this.useremail = this.credentials.useremail;
    this.git = n.git;
    this.name = n.name;
  }
  RED.nodes.registerType("git-config", GitNodesCredNode, {
      credentials: {
          username: {type:"text"},
          useremail: {type:"text"}
      }
  })
}