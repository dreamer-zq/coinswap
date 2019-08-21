<template>
    <el-input v-model="input" :placeholder ="display"></el-input>
</template>

<script>
    export default {
        name: "Input",
        props: {
            display: String
        },
        data() {
            return {
                input: ''
            }
        }
    }
</script>

<style scoped>

</style>