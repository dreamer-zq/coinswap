<template>
  <el-select v-model="defaultValue" filterable :placeholder="placeholder" :disabled="disabled" @change="change">
    <el-option
            v-for="item in itemData"
            :key="item.value"
            :label="item.label"
            :value="item.value">
    </el-option>
  </el-select>
</template>

<script>
  export default {
    name:"Dropdown",
    props: {
      itemData: Array,
      change: Function,
      placeholder: String,
      disabled: Boolean,
    },
    data(){
      return {
        options: [],
        defaultValue: ""
      };
    },
    mounted(){
      if (this.itemData && this.itemData[0]){
        this.defaultValue = this.itemData[0].value
      }
    },
    watch: {
      itemData(){
        this.defaultValue = this.itemData[0].value
      }
    }
  }
</script>