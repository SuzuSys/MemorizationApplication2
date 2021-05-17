<template>
  <div>
    <el-button @click="getData">
      Get
    </el-button>
    <el-button @click="postData">
      Post
    </el-button>
    <el-button @click="deleteData">
      Delete
    </el-button>
  </div>
</template>

<script>
export default {
  name: 'Create',
  data() {
    return {
      dataID: ''
    }
  },
  methods: {
    getData() {
      this.$store.dispatch('getData').then(res => {
        console.log(res.status);
        console.log(res.data);
        console.log(res.data[0]._id);
        this.dataID = res.data[0]._id;
      })
    },
    postData() {
      this.$store.dispatch('postData', {name: 'DirectoryName'}).then(res => {
        console.log(res.status);
      })
    },
    deleteData() {
      console.log(this.dataID);
      this.$store.dispatch('deleteData', {id: this.dataID}).then(res => {
        console.log(res.status);
      })
    }
  }
}
</script>

<style scoped>

</style>