<template>
        <b-container>
            <br />
            <b-carousel
                id="day-selection-carousel"
                v-model="selectedDay"
                controls
                background="#ababab"
            >
                    <b-row class="text-center">
                        <b-col cols="4">
                            <a href="javascript:void(0);" v-if="!logEditMode" @click="goToPreviousDay()" class="nav-link ml-5"><b-icon icon="caret-left-fill" scale="1.5"></b-icon></a>
                        </b-col>
                        <b-col cols="4">
                            <a href="javascript:void(0);" @click="$bvModal.show('date-select-modal')" class="nav-link"><h3>{{dayTitle}}</h3></a>
                            
                            <b-button @click="saveOrEdit()">{{ logEditMode ? "Save" : "Edit"}}</b-button>
                        </b-col>
                        <b-col cols="4">
                            <a href="javascript:void(0);" v-if="!logEditMode" @click="goToNextDay()" class="nav-link mr-5"><b-icon icon="caret-right-fill" scale="1.5"></b-icon></a>
                        </b-col>
                    </b-row>
                    <br />
                    <FoodLogEdit v-if="logEditMode" />
                    <FoodLogBase v-else />
                    <br />
            </b-carousel>
            <br />
            <b-modal 
                id="date-select-modal" 
                title="Please choose a date:"
                @ok="chooseDate()">
                <b-calendar v-model="calendarSelection" block value-as-date></b-calendar>
            </b-modal>
        </b-container>
</template>

<script>
import FoodLogEdit from './FoodLogEdit.vue';
import FoodLogBase from './FoodLogBase.vue';
import { format, subDays, addDays, intervalToDuration, isBefore } from 'date-fns';
import { auth, db } from '../firebase';
import { useUserStore } from '../stores/userStore';
import { useDateLogStore } from '../stores/dateLogStore';
import { useComponentStore } from '../stores/componentStore';
import { useComponentDateLogStore } from '../stores/componentDateLogStore';
import { useFoodStore } from '../stores/foodStore';
export default {
    setup() {
        const userStore = useUserStore();
        const dateLogStore = useDateLogStore();
        const componentStore = useComponentStore();
        const componentDateLogStore = useComponentDateLogStore();
        const foodStore = useFoodStore();

        return {
            userStore,
            dateLogStore,
            componentStore,
            componentDateLogStore,
            foodStore
        }
    },
    created() {
        this.retrieveDateLog(this.currentDateString);
        this.dayTitle = "Today";
        this.initializeComponentLists();
        this.initializeFoodList();
        
    },
    components: {
        FoodLogEdit,
        FoodLogBase
    },
    data() {
        return {
            auth,
            db,
            selectedDay: 0,
            logEditMode: false,
            dayTitle: "",
            calendarSelection: new Date(),
        }
    },
    props:[],
    computed: {
        currentDateString() {
            return format(new Date(), 'MM/dd/yyyy');
        },
        currentDate() {
            return new Date(format(new Date(), 'MM/dd/yyyy'));
        },
        selectedDate() {
            return new Date(this.dateLogStore.date);
        }
    },
    methods: {
        async initializeComponentLists() {
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

                            if (this.isEmpty(this.dateLogStore.dateLogId)) {
                                this.setComponentDateLogFieldsEmpty();
                            } else {
                                this.initializeComponentDateLogs();
                            }
                        })
            } catch (error) {
                console.log(error)
            }
        },
        async initializeComponentDateLogs() {
            try {
                await db.collection('users')
                        .doc(this.auth.currentUser.uid)
                        .collection('dateComponentValues')
                        .where('dateId', '==', this.dateLogStore.dateLogId)
                        .get()
                        .then(snapshot => {
                            if (snapshot.empty) {
                                this.setComponentDateLogFieldsEmpty();
                                return;
                            }
                            this.setComponentDateLogFields(snapshot.docs);

                        })
            } catch (error) {
                console.log(error)
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
        async retrieveDateLog(dateSelection) {
            try {                
                await db.collection('users')
                    .doc(this.auth.currentUser.uid)
                    .collection('dateLogs')
                    .where('date', '==', dateSelection)
                    .limit(1)
                    .get()
                    .then(snapshot => {
                        if (snapshot.empty) {
                            this.setDateLogFields("", dateSelection, [], 5);
                            return;
                        }
                        let snapshotData = snapshot.docs[0].data();
                        this.setDateLogFields(snapshot.docs[0].id, snapshotData.date, snapshotData.foodItems);
                    })
            } catch (error) {
                console.log(error);
            }
        },
        async createDateLog() {
            try {
                await db.collection('users')
                    .doc(this.auth.currentUser.uid)
                    .collection('dateLogs')
                    .add({
                        date: this.dateLogStore.date,
                        foodItems: this.dateLogStore.foodItems,
                    })
                    .then(createdDateLog => {
                        this.dateLogStore.dateLogId = createdDateLog.id;
                        this.createComponentDateLogs(createdDateLog.id);
                    })
            } catch (error) {
                console.log(error)
            }
            
        },
        async createComponentDateLogs(dateLogId) {
            var batch = db.batch();
            const length = this.componentDateLogStore.componentDateLogs.length;
            for (var i = 0; i < length; i++) {
                this.componentDateLogStore.componentDateLogs[i].dateId = dateLogId;
                const componentDateLogDoc = db.collection('users').doc(this.auth.currentUser.uid).collection('dateComponentValues').doc();
                this.componentDateLogStore.componentDateLogs[i].id = componentDateLogDoc.id;
                const newComponentDateLog = 
                {
                    componentId: this.componentDateLogStore.componentDateLogs[i].componentId,
                    dateId: this.componentDateLogStore.componentDateLogs[i].dateId,
                    multiValues: this.componentDateLogStore.componentDateLogs[i].multiValues,
                    singleValue: this.componentDateLogStore.componentDateLogs[i].singleValue,
                    sliderValue: this.componentDateLogStore.componentDateLogs[i].sliderValue
                }
                batch.set(componentDateLogDoc, newComponentDateLog);
            }

            await batch.commit();
        },
        async updateDateLog() {
            try {
                await db.collection('users')
                    .doc(this.auth.currentUser.uid)
                    .collection('dateLogs')
                    .doc(this.dateLogStore.dateLogId)
                    .update({
                        foodItems: this.dateLogStore.foodItems
                    })
                    .then(() => {
                        this.updateComponentDateLogs();
                    });
            } catch (error) {
                console.log(error);
            }
        },
        async updateComponentDateLogs() {
            var batch = db.batch();
            const length = this.componentDateLogStore.componentDateLogs.length;
            for (var i = 0; i < length; i++) {
                const componentDateLogDoc = db.collection('users').doc(this.auth.currentUser.uid).collection('dateComponentValues').doc(this.componentDateLogStore.componentDateLogs[i].id);
                batch.update(componentDateLogDoc, 
                {
                    multiValues: this.componentDateLogStore.componentDateLogs[i].multiValues,
                    singleValue: this.componentDateLogStore.componentDateLogs[i].singleValue,
                    sliderValue: this.componentDateLogStore.componentDateLogs[i].sliderValue,
                });
            }

            await batch.commit();
        },
        async addFood() {
            try {
                var batch = db.batch();
                for (var food of this.dateLogStore.foodItems) {
                    if (null === food.id) {
                        const existingFood = this.foodStore.getExistingFood(food.name);
                        console.log(existingFood);
                        if (existingFood !== null) {
                            food.id = existingFood.id;
                            continue;
                        }
                        const foodDoc = db.collection('users').doc(this.auth.currentUser.uid).collection('foods').doc();
                        const newFood = 
                            {
                                name: food.name
                            }
                        batch.set(foodDoc, newFood);
                        food.id = foodDoc.id;
                    }
                }

                await batch.commit();
            } catch (error) {
                console.log(error);
            }
        },
        setDateLogFields(dateLogId, date, foodItems) {
            this.dateLogStore.dateLogId = dateLogId;
            this.dateLogStore.date = date;
            this.dateLogStore.foodItems = foodItems;
            this.calendarSelection = new Date(date);
        },
        setComponentDateLogFields(values) {
            this.componentDateLogStore.componentDateLogs = 
                values.map(value => {
                    const component = this.componentStore.selectedComponentMap.get(value.data().componentId);
                    let componentDateLogData =
                    {
                        id: value.id,
                        dateId: value.data().dateId,
                        componentId: value.data().componentId,
                        componentName: component.name,
                        componentSelectOptions: component.selectOptions,
                        typeId: component.typeId,
                        order: component.order,
                        sliderValue: value.data().sliderValue,
                        singleValue: value.data().singleValue,
                        multiValues: value.data().multiValues,
                    }
                    return componentDateLogData;
                });
            this.componentDateLogStore.componentDateLogs.sort((a,b) => a.order - b.order);
        
        },
        setComponentDateLogFieldsEmpty() {
            this.componentDateLogStore.componentDateLogs = [];
            for (const index in this.componentStore.selectedComponents) {
                const component = this.componentStore.selectedComponents[index];
                this.componentDateLogStore.componentDateLogs.push(
                    {
                        id: "",
                        dateId: "",
                        componentId: component.id,
                        componentName: component.name,
                        componentSelectOptions: component.selectOptions,
                        typeId: component.typeId,
                        order: component.order,
                        sliderValue: 5,
                        singleValue: "",
                        multiValues: []
                    }
                );
            }
            this.componentDateLogStore.componentDateLogs.sort((a,b) => a.order - b.order);     
        },
        saveOrEdit() {
            if (this.logEditMode) {
                this.addFood();
                if (this.dateLogStore.dateLogId != "") {
                    this.updateDateLog();
                } else {
                    this.createDateLog();
                }
            }
            this.logEditMode = !this.logEditMode;
        },
        async goToNextDay() {
            const nextDay = addDays(this.selectedDate, 1);
            const timeApart = this.differenceFromToday(nextDay);
            console.log(timeApart);
            await this.retrieveDateLog(format(nextDay, 'MM/dd/yyyy'))
                .then(() => {
                    this.setDateString(timeApart);
                    this.initializeComponentDateLogs();
                });
            
        },
        async goToPreviousDay() {
            const previousDay = subDays(this.selectedDate, 1);
            const timeApart = this.differenceFromToday(previousDay);
            console.log(timeApart);
            this.retrieveDateLog(format(previousDay, 'MM/dd/yyyy'));
            await this.retrieveDateLog(format(previousDay, 'MM/dd/yyyy'))
                .then(() => {
                    this.setDateString(timeApart);
                    this.initializeComponentDateLogs();
                });
        },
        differenceFromToday(targetDate) {
            console.log(targetDate);
            return intervalToDuration({
                start: targetDate,
                end: this.currentDate
            });
        },
        setDateString(timeApart) {
            if (timeApart.months == 0 && timeApart.years == 0) {
                if (timeApart.days == 1 && isBefore(this.currentDate, this.selectedDate)) {
                    this.dayTitle = "Tomorrow";
                } else if (timeApart.days == 0) {
                    this.dayTitle = "Today";
                } else if (timeApart.days == 1 && isBefore(this.selectedDate, this.currentDate)) {
                    this.dayTitle = "Yesterday";
                } else {
                    this.dayTitle = this.selectedDate.getMonth() + 1 + "/" + this.selectedDate.getDate() + "/" + this.selectedDate.getFullYear();
                }
            } else {
                this.dayTitle = this.selectedDate.getMonth() + 1 + "/" + this.selectedDate.getDate() + "/" + this.selectedDate.getFullYear();
            }
        },
        async chooseDate() {
            const timeApart = this.differenceFromToday(this.calendarSelection);
            await this.retrieveDateLog(format(this.calendarSelection, 'MM/dd/yyyy'))
                .then(() => {
                    this.setDateString(timeApart);
                });
        },
        isEmpty(str) {
            return (!str || str.length === 0 );
        }

    }
}
</script>

<style scoped>
    a.nav-link:link
    {
    color: #000000;
    text-decoration: none;
    }
    a.nav-link:visited
    {
    color: #000000;
    text-decoration: none;
    }
    a.nav-link:hover
    {
    color: #000000;
    text-decoration: none;
    }
    a.nav-link:active
    {
    color: #000000;
    text-decoration: none;
    }
</style>