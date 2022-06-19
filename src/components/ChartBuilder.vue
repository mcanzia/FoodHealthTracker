<template>
    <b-container fluid class="remove-all-margin-padding">
        <ChartGrid @add-new-chart="$bvModal.show('chart-build-modal')" />
        <b-modal id="chart-build-modal">Hello From My Modal!</b-modal>
    </b-container>
    
</template>

<script>
import { auth, db } from '../firebase';
//import ChartBar from './ChartBar.vue';
import ChartGrid from './ChartGrid.vue';
export default {
    setup() {
        return {
            
        }
    },
    data() {
        return {
            auth,
            db
        }
    },
    components: {
        //ChartBar,
        ChartGrid
    }
}
</script>

<style scoped>
.remove-all-margin-padding{
    margin:0 !important;
    padding:0 !important;
}
</style>