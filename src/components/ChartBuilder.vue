<template>
    <b-container fluid class="remove-all-margin-padding">
        <ChartGrid @add-new-chart="openBuildChartModal" :new-chart="newChart"/>
        <b-sidebar ref="chart-build-sidebar" id="chart-build-sidebar" v-model="sidebarVisible" :title="newChart.chartType" @shown="createTempChart" @hidden="removeTempChart" shadow right>
            <b-form class="form-style">
                <label for="chart-title">Chart Title</label>
                <b-form-input id="chart-title" v-model="newChart.chartOptions.plugins.title.text" @blur="updateTempChartTitle"></b-form-input>
                <br />
                <label for="chart-component-select">Chart Component</label>
                <b-form-select id="chart-component-select" v-model="componentSelection" @change="updateTempChartComponent">
                    <option v-for="option in componentSelectOptions" :key="option.id" :value="option">
                        {{ option.name }}
                    </option>
                </b-form-select>
                <br />
                <br />
                <label for="chart-start-date-select">Start Date</label>
                <b-form-datepicker id="chart-start-date-select" v-model="newChart.chartData.startDate"></b-form-datepicker>
                <br />
                <label for="chart-end-date-select">End Date</label>
                <b-form-datepicker id="chart-end-date-select" v-model="newChart.chartData.endDate"></b-form-datepicker>
                <br />
                <label for="target-food-select">Target Food</label>
                <b-form-select id="target-food-select" :options="this.foodStore.foods" text-field="name"></b-form-select>
                <br />
                <br />
                <b-button type="submit" variant="primary">Save</b-button>
                <b-button type="reset" variant="danger" class="ml-2">Reset</b-button>
            </b-form>
        </b-sidebar>
    </b-container>
    
</template>

<script>
import { auth, db } from '../firebase';
import { useComponentStore } from '../stores/componentStore';
import { useFoodStore } from '../stores/foodStore';
import { useChartStore } from '../stores/chartStore';
import ChartGrid from './ChartGrid.vue';
import { bus } from '../main';
export default {
    setup() {
        const componentStore = useComponentStore();
        const foodStore = useFoodStore();
        const chartStore = useChartStore();
        return {
            componentStore,
            foodStore,
            chartStore
        }
    },
    data() {
    
        return {
            auth,
            db,
            newChart: {
                type: "",
                chartData: {
                    labels: [],
                    datasets: [],
                    startDate: '',
                    endDate: '',
                },
                chartOptions: {
                    plugins: {
                        title: {
                            display: true,
                            text: ''
                        }
                    },
                },
                building: false,
            },
            componentSelectOptions: [],
            componentSelection: null,
            sidebarVisible: false,
        }
    },
    components: {
        ChartGrid
    },
    created() {
        this.getComponentsFromDb();
        this.initializeFoodList();
    },
    computed: {
        maxStartDate() {
            return this.endDate !== "" || this.endDate !== undefined ? new Date(this.endDate) : new Date('2970-01-01T00:00:00'); 
        },
        minEndDate() {
            return this.startDate !== "" || this.startDate !== undefined ? new Date(this.startDate) : new Date('1970-01-01T00:00:00');
        },
        chartStoreLastIndex() {
            return this.chartStore.charts.length - 1;
        }
    },
    methods: {
        openBuildChartModal : function(type) {
            switch(type) {
                case "bar":
                    this.newChart.chartType = "bar";
                    break;
                case "line":
                    this.newChart.chartType = "line";
                    break;
                case "pie":
                    this.newChart.chartType = "pie";
                    break;
                case "doughnut":
                    this.newChart.chartType = "doughnut";
                    break;
                case "radar":
                    this.newChart.chartType = "radar";
                    break;
                default:
                    this.newChart.chartType = "bar";
                    break;
            }
            //this.$refs["chart-build-modal"].show();
            this.sidebarVisible = !this.sidebarVisible; 
        },
        createTempChart() {
            const id = db.collection('users').doc(this.auth.currentUser.uid).collection('charts').doc().id;
            const chartData = {
                    labels: ["", ""],
                    datasets: [
                        {
                            label: "",
                            data: [5, 10]
                        }
                    ],
                    startDate: '',
                    endDate: '',
                }
            const chartOptions = {
                    plugins: {
                        title: {
                            display: true,
                            text: ''
                        }
                    },
                    }
            this.chartStore.charts.push({
                id: id,
                chartType: this.newChart.chartType,
                chartData: chartData,
                chartOptions: chartOptions,
                building: true,
            });
        },
        updateTempChartTitle() {
            this.chartStore.charts[this.chartStoreLastIndex].chartOptions.plugins.title.text = this.newChart.chartOptions.plugins.title.text;
            this.notifyChartUpdates();
        },
        updateTempChartComponent() {
            console.log(this.componentSelection.typeId);
            //this.chartStore.charts[this.chartStoreLastIndex].chartData = this.newChart.chartData;   
            //this.notifyChartUpdates();         
        },
        removeTempChart() {
            this.chartStore.charts.pop();
            this.newChart = {
                type: "",
                chartData: {
                    labels: [],
                    datasets: [],
                    startDate: '',
                    endDate: '',
                },
                chartOptions: {
                    plugins: {
                        title: {
                            display: true,
                            text: ''
                        }
                    },
                },
                building: false,
            }
        },
        notifyChartUpdates() {
            bus.$emit('chart-update', {
                chart: this.chartStore.charts[this.chartStoreLastIndex]
            });
        },
        async getComponentsFromDb() {
            try {
                await db.collection('users')
                        .doc(this.auth.currentUser.uid)
                        .collection('components')
                        .get()
                        .then(snapshot => {
                            if (snapshot.empty) {
                                return;
                            }
                            this.componentStore.availableComponents = snapshot.docs.filter(selection => !isSelected(selection)).map(selection => setComponentData(selection));
                            this.componentStore.selectedComponents = snapshot.docs.filter(selection => isSelected(selection)).map(selection => setComponentData(selection));
                            this.componentStore.selectedComponentMap = new Map(this.componentStore.selectedComponents.map(selection => setComponentMap(selection)));
                            this.componentSelectOptions = this.componentStore.selectedComponents;
                            
                            function isSelected(component) {
                                return component.data().selected;
                            }

                            function setComponentData(component) {
                                let componentData = 
                                {
                                    name: component.data().name,
                                    id: component.id,
                                    typeId: component.data().typeId,
                                    order: component.data().order,
                                    selectOptions: component.data().selectOptions,
                                    selected: component.data().selected
                                }
                                return componentData;
                            }

                            function setComponentMap(component) {
                                return [component.id,
                                        {
                                            name: component.name,
                                            typeId: component.typeId,
                                            order: component.order,
                                            selectOptions: component.selectOptions
                                        }
                                ];
                            }
                        });
            } catch (e) {
                console.log(e);
            }
        },
        async initializeFoodList() {
            try {
                await db.collection('users')
                        .doc(this.auth.currentUser.uid)
                        .collection('foods')
                        .get()
                        .then(snapshot => {
                            if (snapshot.empty) {
                                return;
                            }
                            this.foodStore.foods = snapshot.docs.map(value => {
                                    let foodData =
                                        {
                                            id: value.id,
                                            name: value.data().name
                                        }
                                        return foodData;
                                    });
                        })
                
            } catch (error) {
                console.log(error)
            }
        },
    }
}
</script>

<style scoped>
.remove-all-margin-padding{
    margin:0 !important;
    padding:0 !important;
}
.form-style {
    padding: 10px !important;
}
</style>