<template>
    <div>
    <b-row>
        <b-col></b-col>
        <b-col cols="8">
            <b-card>
                <b-card-title>What you ate today:</b-card-title>
            </b-card>
        </b-col>
        <b-col></b-col>
    </b-row>
    <b-row>
        <b-col></b-col>
        <b-col cols="8">
            <b-card>
                <b-list-group v-for="item in dateLogStore.foodItems" :key="item">
                    <b-list-group-item>{{ item }}</b-list-group-item>
                </b-list-group>
            </b-card>
        </b-col>
        <b-col></b-col>
    </b-row>
    <b-row>
        <b-col></b-col>
        <b-col cols="8">
            <b-card v-for="(component) in componentDateLogStore.componentDateLogs" :key="component.componentId">
                <b-form v-if="component.typeId == 1">
                    <label for="component-range">{{component.componentName}}</label>
                    <b-form-input id="component-range" type="range" min="0" max="10" step="0.10" disabled class="text-center" v-model="component.sliderValue"></b-form-input>
                </b-form>
                <b-form v-if="component.typeId == 2">
                    <label for="component-radio">{{component.componentName}}</label>
                    <b-form-radio-group id="component-radio" :options="component.componentSelectOptions" text-field="text" value-field="value" disabled class="text-center" v-model="component.singleValue"></b-form-radio-group>
                </b-form>
                <b-form v-if="component.typeId == 3">
                    <label for="component-checkbox">{{component.componentName}}</label>
                    <b-form-checkbox-group id="component-checkbox" :options="component.componentSelectOptions" text-field="text" value-field="value" disabled class="text-center" v-model="component.multiValues"></b-form-checkbox-group>
                </b-form>
            </b-card>
        </b-col>
        <b-col></b-col>
    </b-row>
    </div>
</template>

<script>
import { useDateLogStore } from '../stores/dateLogStore';
import { useComponentStore } from '../stores/componentStore';
import { useComponentDateLogStore } from '../stores/componentDateLogStore';
export default {
    setup() {
        const dateLogStore = useDateLogStore();
        const componentStore = useComponentStore();
        const componentDateLogStore = useComponentDateLogStore();

        return {
            dateLogStore,
            componentStore,
            componentDateLogStore,
        }
    },
    components: {
    },
    data() {
        return {
            selectedDay: 0,
        }
    },
    methods: {
    }
}
</script>