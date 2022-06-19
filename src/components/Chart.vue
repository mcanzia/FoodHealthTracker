<template>
    <b-container class="remove-all-margin-padding">
            <Bar :chart-data="chartData" :chart-options="chartOptions" :styles="chartStyles" />
    </b-container>
</template>

<script>
import { auth, db } from '../firebase';
import { Bar } from 'vue-chartjs/legacy';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);
export default {
    setup() {
        return {
            
        }
    },
    data() {
        return {
            auth,
            db,
            chartData: {
                labels: [ 'January', 'February', 'March', 'April', 'May'],
                datasets: [
                {
                    label: 'Data One',
                    backgroundColor: 'rgb(255, 205, 86)',
                    data: [40, 20, 12]
                }
                ],
            },
            chartOptions: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Custom Chart Title'
                    }
                }
            },
            chartStyles: {
                borderColor: [
                    'rgb(255, 99, 132)',
                    'rgb(255, 159, 64)',
                    'rgb(255, 205, 86)',
                ]
            }
        }
    },
    components: {
        Bar
    }
}
</script>

<style scoped>
.remove-all-margin-padding{
    margin:0 !important;
    padding:0 !important;
}
</style>