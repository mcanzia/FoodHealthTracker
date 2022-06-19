<template>
    <b-container fluid class="remove-all-margin-padding background-gray display-table" style="height: 1000px">
        <b-row no-gutters v-for="r in numberOfRows" :key="r">
            <b-col cols="4" v-for="(chart, index) in charts.slice(chartStartIndex(r), chartEndIndex(r))" :key="index">
                <div class="card-chart-slot">
                    <Chart />
                </div>
            </b-col>
            <b-col cols="4" v-if="chartEndIndex(r) == charts.length">
                <div class="card-chart-slot">                    
                        <span class="change-icon add-chart">
                        <b-icon icon="plus-circle" class="bi h1" variant="dark"></b-icon>
                        <b-icon icon="plus-circle-fill" class="bi h1" variant="dark" @click="addNewChart()"></b-icon>
                        </span>
                </div>            
            </b-col>
        </b-row>
        
                        <!--<vue-draggable-resizable :parent="true" :lock-aspect-ratio="true" :maxWidth="500" :maxHeight="500" :minHeight="320" :minWidth="320" :w="400" :h="400" :grid=[80,80] class="chart-slot">
                        </vue-draggable-resizable>-->
    </b-container>
</template>

<script>
import { auth, db } from '../firebase';
import Chart from './Chart.vue';
export default {
    setup() {
        return {
            
        }
    },
    data() {
        return {
            auth,
            db,
            present: false,
            height: 1000,
            width: 1000,
            charts: [],
        }
    },
    components: {
        Chart
    },
    created() {
        this.charts.push({ name: "chart1"});
        this.charts.push({ name: "chart1"});
        this.charts.push({ name: "chart1"});
        this.charts.push({ name: "chart1"});
    },
    mounted() {
        this.setParentSize();
    },
    methods: {
        getParentSize () {
            const style = window.getComputedStyle(this.$el.parentNode, null)
            console.log("style --> " + style);
            console.log("Width --> "+ parseInt(style.getPropertyValue('width'), 10));
            console.log("Height --> "+ parseInt(style.getPropertyValue('height'), 10));
        },
        setParentSize () {
            const style = window.getComputedStyle(this.$el.parentNode, null)
            this.width = parseInt(style.getPropertyValue('width'), 10);
            //this.height = parseInt(style.getPropertyValue('height'), 10);
        },
        addNewChart() {
            this.$emit('add-new-chart', true);
        },
        chartStartIndex(row) {
            return 3 * (row - 1);
        },
        chartEndIndex(row) {
            return this.charts.length - this.chartStartIndex(row);
        }
    },
    computed: {
        numberOfRows() {
            return Math.floor(this.charts.length / 3) + 1;
        }
    },
}
</script>

<style>
.remove-all-margin-padding{
    margin:0 !important;
    padding:0 !important;
}
.display-table {
    display: table;
}
.chart-slot {
    background-color: white;
    border: 0px;
    border-radius: 25px;
    display: table-cell;
    margin: 10px 10px 10px 10px;
}
.card-chart-slot {
    background-color: white;
    border: 0px;
    border-radius: 25px;
    margin: 10px 10px 10px 10px;
}
.background-gray {
    background-color: lightgrey;
}

.change-icon > .bi + .bi,
  .change-icon:hover > .bi {
    display: none;
  }
  .change-icon:hover > .bi + .bi {
    display: inherit;
  }

.add-chart {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>