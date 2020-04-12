import { DefaecoConstants } from '../defaecoConstants';
//import * as firebase from 'firebase-admin'; //this is for cloud functions
import * as firebase from 'firebase'; //this is for cloud functions
import * as moment from 'moment';
import * as momentTz from 'moment-timezone';

export class DefaecoVMS{
    db:any = firebase.firestore();
    public async createVendor(vendorOverview:VendorOverview,vendorDetails:VendorDetails,
        vendorContactDetails:VendorContactDetails,vendorBankingDetails:VendorBankingDetails,
        vendorServicePackage:VendorServicePackage,vendorCoupon:VendorCoupon,user:AuthUser):Promise<DefaecoEntityResponse>{
        let resp: DefaecoEntityResponse = new DefaecoEntityResponse();
        try{
            if(user.email == DefaecoConstants.ADMIN_EMAIL){ 

                //Validate all the fields
                let vendorOverviewSaveResp:DefaecoEntityResponse = vendorOverview.validateEntity();
                if(vendorOverviewSaveResp.isError){ return vendorOverviewSaveResp; }
                let vendorDetailsSaveResp = vendorDetails.validateEntity();
                if(vendorDetailsSaveResp.isError){ return vendorDetailsSaveResp; }
                let vendorDetailsForListing:VendorDetailsForListing = new VendorDetailsForListing();
                let VendorDetailsForListingResp = vendorDetailsForListing.validateEntity(vendorOverview);
                if(vendorDetailsSaveResp.isError){ return VendorDetailsForListingResp; }
                let vendorContactDetailsSaveResp = vendorContactDetails.validateEntity();
                if(vendorContactDetailsSaveResp.isError){ return vendorContactDetailsSaveResp; }
                let vendorBankingDetailsSaveResp = vendorBankingDetails.validateEntity();
                if(vendorBankingDetailsSaveResp.isError){ return vendorBankingDetailsSaveResp; }
                let vendorServicePackageSaveResp = vendorServicePackage.validateEntity();
                if(vendorServicePackageSaveResp.isError){ return vendorServicePackageSaveResp; }
                let vendorCouponSaveResp = vendorCoupon.validateEntity();
                if(vendorCouponSaveResp.isError){ return vendorCouponSaveResp; }

                //if all the models are valid then save to DB
                
                const vendorOverviewEntityDB = this.db.collection(DefaecoConstants.ENTITY_VENDOR_OVERVIEW);
                const vendotDetailsEntityDB = this.db.collection(DefaecoConstants.ENTITY_VENDOR_DETAILS);
                const vendorDetailsForListEntityDB = this.db.collection(DefaecoConstants.ENTITY_VENDOR_DETAILS_LIST);
                const vendorContactDetailsForListEntityDB = this.db.collection(DefaecoConstants.ENTITY_VENDOR_CONTACT_DETAILS);
                const vendorBankingDetailsEntityDB = this.db.collection(DefaecoConstants.ENTITY_VENDOR_BANKING_DETAILS);
                const vendorServicePackageEntityDB = this.db.collection(DefaecoConstants.ENTITY_VENDOR_SERVICE_PACKAGE);
                const vendorCouponEntityDB = this.db.collection(DefaecoConstants.ENTITY_VENDOR_COUPON);


                const vendorId:string = vendorOverviewEntityDB.doc().id;//get vendorId
                //update reference
                vendorOverview.vendorId = vendorId;
                vendorDetails.vendorId = vendorId;
                vendorDetailsForListing.vendorId = vendorId;
                vendorContactDetails.vendorId = vendorId;
                vendorBankingDetails.vendorId = vendorId;
                vendorServicePackage.vendorId = vendorId;
                vendorCoupon.vendorId = vendorId;


                let batch = this.db.batch();// Get a new write batch
                const vendorOverviewEntityRef = vendorOverviewEntityDB.doc(vendorId);
                const vendorDetailsEntityRef = vendotDetailsEntityDB.doc(vendorId);
                const vendorDetailsListEntityRef = vendorDetailsForListEntityDB.doc(vendorId);
                const vendorContactDetailsEntityRef = vendorContactDetailsForListEntityDB.doc(vendorId);
                const vendorBankingDetailsEntityRef = vendorBankingDetailsEntityDB.doc(vendorId);
                const vendorServicePackageEntityRef = vendorServicePackageEntityDB.doc(vendorId);
                const vendorCouponEntityRef = vendorCouponEntityDB.doc(vendorId);

                batch.set(vendorOverviewEntityRef,vendorOverview.toFirestoreObj());
                batch.set(vendorDetailsEntityRef,vendorDetails.toFirestoreObj());
                batch.set(vendorDetailsListEntityRef,vendorDetailsForListing.toFirestoreObj());
                batch.set(vendorContactDetailsEntityRef,vendorContactDetails.toFirestoreObj());
                batch.set(vendorBankingDetailsEntityRef,vendorBankingDetails.toFirestoreObj());
                batch.set(vendorServicePackageEntityRef,vendorServicePackage.toFirestoreObj());
                batch.set(vendorCouponEntityRef,vendorCoupon.toFirestoreObj());
                await batch.commit();//commit batched writes
                resp.isError = false;
                resp.data = {
                    'msg':`Vendor ${vendorOverview.emailId} Added successfully`
                }
               
            }else{
                throw new Error("Error : Not Authorized");
            }
        }catch(e){
            resp.isError = true;
            resp.errorMsg = e.message;
        }
        return resp;
    }
    public async updateVendor(vendorOverview:VendorOverview,vendorDetails:VendorDetails,
        vendorContactDetails:VendorContactDetails,vendorBankingDetails:VendorBankingDetails,
        vendorServicePackage:VendorServicePackage,vendorCoupon:VendorCoupon,user:AuthUser):Promise<DefaecoEntityResponse>{
            
        let resp: DefaecoEntityResponse = new DefaecoEntityResponse();
            try{
                let batch = this.db.batch();
                //get vendor by vendorId
                let vendorOverviewMaster:VendorOverview = new VendorOverview();
                vendorOverviewMaster = await vendorOverviewMaster.getById(this.db,vendorOverview.vendorId);
                if(vendorOverviewMaster && (vendorOverviewMaster.emailId == user.email || user.email == DefaecoConstants.ADMIN_EMAIL)){
                    debugger;
                    //save overview
                    //update vendor overivew with non editable fields
                    vendorOverview.vendorId = vendorOverviewMaster.vendorId;
                    vendorOverview.emailId = vendorOverviewMaster.emailId;
                    let vendorOverviewSaveResp:DefaecoEntityResponse = vendorOverview.validateEntity();
                    if(vendorOverviewSaveResp.isError){ return vendorOverviewSaveResp; }
                    const vendorOverviewEntityDB = this.db.collection(DefaecoConstants.ENTITY_VENDOR_OVERVIEW);
                    const vendorOverviewEntityRef = vendorOverviewEntityDB.doc(vendorOverviewMaster.vendorId);
                    batch.set(vendorOverviewEntityRef,vendorOverview.toFirestoreObj());
                    //save vendorDetailsForListing
                    let vendorDetailsForListing:VendorDetailsForListing = new VendorDetailsForListing();
                    vendorDetailsForListing.vendorId = vendorOverviewMaster.vendorId;
                    let VendorDetailsForListingResp = vendorDetailsForListing.validateEntity(vendorOverview);
                    if(VendorDetailsForListingResp.isError){ return VendorDetailsForListingResp; }
                    const vendorDetailsForListEntityDB = this.db.collection(DefaecoConstants.ENTITY_VENDOR_DETAILS_LIST);
                    const vendorDetailsListEntityRef = vendorDetailsForListEntityDB.doc(vendorOverviewMaster.vendorId);
                    batch.set(vendorDetailsListEntityRef,vendorDetailsForListing.toFirestoreObj());
                    //save vendorDetails
                    if(vendorDetails){
                        vendorDetails.vendorId = vendorOverviewMaster.vendorId;
                        let vendorDetailsSaveResp = vendorDetails.validateEntity();
                        if(vendorDetailsSaveResp.isError){ return vendorDetailsSaveResp; }
                        const vendotDetailsEntityDB = this.db.collection(DefaecoConstants.ENTITY_VENDOR_DETAILS);
                        const vendorDetailsEntityRef = vendotDetailsEntityDB.doc(vendorOverviewMaster.vendorId);
                        batch.set(vendorDetailsEntityRef,vendorDetails.toFirestoreObj());
                    }
                    //save vendorContactDetails
                    if(vendorContactDetails){
                        vendorContactDetails.vendorId = vendorOverviewMaster.vendorId;
                        let saveResp = vendorContactDetails.validateEntity();
                        if(saveResp.isError){ return saveResp; }
                        const vendorContactDetailsEntityDB = this.db.collection(DefaecoConstants.ENTITY_VENDOR_CONTACT_DETAILS);
                        const vendorContactDetailsEntityRef = vendorContactDetailsEntityDB.doc(vendorOverviewMaster.vendorId);
                        batch.set(vendorContactDetailsEntityRef,vendorContactDetails.toFirestoreObj());
                    }
                    //save vendorContactDetails
                    if(vendorBankingDetails){
                        vendorBankingDetails.vendorId = vendorOverviewMaster.vendorId;
                        let saveResp = vendorBankingDetails.validateEntity();
                        if(saveResp.isError){ return saveResp; }
                        const vendorBankingDetailsEntityDB = this.db.collection(DefaecoConstants.ENTITY_VENDOR_BANKING_DETAILS);
                        const vendorBankingDetailsEntityRef = vendorBankingDetailsEntityDB.doc(vendorOverviewMaster.vendorId);
                        batch.set(vendorBankingDetailsEntityRef,vendorBankingDetails.toFirestoreObj());
                    }
                    //save vendorServicePackage
                    if(vendorServicePackage){
                        vendorServicePackage.vendorId = vendorOverviewMaster.vendorId;
                        let saveResp = vendorServicePackage.validateEntity();
                        if(saveResp.isError){ return saveResp; }
                        const vendorServicePackageEntityDB = this.db.collection(DefaecoConstants.ENTITY_VENDOR_SERVICE_PACKAGE);
                        const vendorServicePackageEntityRef = vendorServicePackageEntityDB.doc(vendorOverviewMaster.vendorId);
                        batch.set(vendorServicePackageEntityRef,vendorServicePackage.toFirestoreObj());
                    }
                    //save vendorCoupon
                    if(vendorCoupon){
                        vendorCoupon.vendorId = vendorOverviewMaster.vendorId;
                        let saveResp = vendorCoupon.validateEntity();
                        if(saveResp.isError){ return saveResp; }
                        const vendorCouponEntityDB = this.db.collection(DefaecoConstants.ENTITY_VENDOR_COUPON);
                        const vendorCouponEntityRef = vendorCouponEntityDB.doc(vendorOverviewMaster.vendorId);
                        batch.set(vendorCouponEntityRef,vendorCoupon.toFirestoreObj());
                    }
                    await batch.commit();//commit batched writes
                    resp.isError = false;
                    resp.data = {
                        'msg':'Vendor updated successfully'
                    }
                }else{
                   throw new Error("Error : Not Authorized")
                }
            }catch(e){
                resp.isError = true;
                resp.errorMsg = e.message;
            }
        return resp;

    }
    /*
    async blockVendor(vendorId:string,vendorEmailId:string):Promise<DefaecoEntityResponse> {
        let resp: DefaecoEntityResponse = new DefaecoEntityResponse();
        try{
            let userRecord = await firebase.auth().getUserByEmail(vendorEmailId);
        if(userRecord && userRecord.uid){
            //await firebase.auth().updateUser(userRecord.uid, {disabled: true});  //now disable it
            const db:any = firebase.firestore();
            const vendorOverviewRef = db.collection(DefaecoConstants.ENTITY_VENDOR_OVERVIEW).doc(vendorId);
            let fieldsToUpdate:any = {isBlocked:true,modifiedOn:Date.now()}
            let batch = db.batch();
            batch.set(vendorOverviewRef, fieldsToUpdate,{ merge: true });
            await batch.commit();
            resp.isError = false;
        }else {
            resp.isError = true;
            resp.errorMsg ="Invalid Vendor";
        }
        }catch(e){
            resp.isError = true;
            resp.errorMsg = "Unhandled Error";
            resp.errorObj = e;
        }
        return resp;

        
    }
    public async unblockVendor(vendorId:string,vendorEmailId:string):Promise<DefaecoEntityResponse> {
        let resp: DefaecoEntityResponse = new DefaecoEntityResponse();
        try{
            let userRecord = await firebase.auth().getUserByEmail(vendorEmailId);
            if(userRecord && userRecord.uid){
                //await firebase.auth().updateUser(userRecord.uid, {disabled: false});  //now enable it
                const db:any = firebase.firestore();
                const vendorOverviewRef = db.collection(DefaecoConstants.ENTITY_VENDOR_OVERVIEW).doc(vendorId);
                let fieldsToUpdate:any = {isBlocked:false,modifiedOn:Date.now()}
                let batch = db.batch();
                batch.set(vendorOverviewRef, fieldsToUpdate,{ merge: true });
                await batch.commit();
                resp.isError = false;
            }else {
                resp.isError = true;
                resp.errorMsg ="Invalid Vendor";
            }
        }catch(e){
            resp.isError = true;
            resp.errorMsg = "Unhandled Error";
            resp.errorObj = e;
        }
        return resp;
    }
    */
    public async createOrder(vendorId: string = "",
        packageId: string = "", addonIds: string[] = [],
        startingSlot: number = -1, bayNumber: number = -1, vehicleType: string = "",
        couponCode: string = "", date: string = "", user: any, customerName: string = '',
        customerContactNumber: string = '', reqTaxPercentage: number = 0, reqCustomerGSTN: string = "",
        discount: number = 0) {
        console.time();
        let response: DefaecoEntityResponse = new DefaecoEntityResponse();
        try {
            let vendorOverview: VendorOverview = new VendorOverview();
            const _vendorPromise: any = vendorOverview.getById(this.db, vendorId);
            const _vendorServicePkgPromise: any = VendorServicePackage.getById(this.db, vendorId);
            let results = await Promise.all([_vendorPromise, _vendorServicePkgPromise]); //Returned values will be in order of the Promises passed, regardless of completion order.
            vendorOverview = results[0];
            let vendorServicePackages: VendorServicePackage = results[1];
            let servicePackageIds: string[] = [packageId].concat(addonIds);
            let servicesTobeBooked: ServicePackage[] = [];
            let totalSlotRequired: number = 0;
            let totalPackagePrice: number = 0;
            let discountTobeApplied: number = 0;
            let finalPriceWithoutTax: number = 0;
            let finalPriceWithTax: number = 0;
            let isPremium: boolean = false;
            let couponApplied = false;
            let taxPercentage = DefaecoConstants.taxPercentage;
            let isRequestFromVendor = false;
            let isSpecialDay = vendorOverview.specialDays.indexOf(date) > -1 ? true : false;
            let slotDate: moment.Moment = moment(date, DefaecoConstants.DATE_FORMAT);
            vendorServicePackages.servicePackages.map((sp: ServicePackage) => {
                sp = ServicePackage.toInstace(sp);
                if (servicePackageIds.indexOf(sp.code) > -1) {
                    servicesTobeBooked.push(sp);
                    isPremium = (isPremium || sp.isPremium) ? true : false;
                    totalPackagePrice = totalPackagePrice + sp.getPackagePrice(vehicleType, isSpecialDay);
                    totalSlotRequired = totalSlotRequired + sp.getPackageSlots(vehicleType);
                }
            });
            if (user.email == vendorOverview.emailId || user.email == DefaecoConstants.ADMIN_EMAIL) {
                isRequestFromVendor = true;
                discountTobeApplied = discount;
                taxPercentage = reqTaxPercentage && reqTaxPercentage >= 0 && reqTaxPercentage < 100 ? reqTaxPercentage : DefaecoConstants.taxPercentage;
            }
            //coupon
            if (couponCode) {
                const vendorCoupon: VendorCoupon = await VendorCoupon.getById(this.db, vendorOverview.vendorId);
                let isValidCoupon = vendorCoupon.isCouponApplicable(couponCode, slotDate);
                if (isValidCoupon) {
                    discountTobeApplied = vendorCoupon.getDiscountAmount(totalPackagePrice);
                    couponApplied = true;
                } else {
                    throw new Error("Error : Coupon Expired, Invalid Requequest");
                }
            }

            //add discount
            finalPriceWithoutTax = totalPackagePrice - discountTobeApplied;
            //now add tax
            const taxAmount = finalPriceWithoutTax * ((taxPercentage) / 100) //0.18;
            finalPriceWithTax = finalPriceWithoutTax + taxAmount;
            let requiredSlotsResp: DefaecoEntityResponse = this.getAllRequiredSlots(date, startingSlot, bayNumber + "", vendorOverview, totalSlotRequired, isPremium, finalPriceWithTax)
            if (requiredSlotsResp.isError) { return requiredSlotsResp; }

            let requiredSlots: DefaecoSlot[] = requiredSlotsResp.data;
            let requiredSlotIds: string[] = requiredSlots.map((slot: DefaecoSlot) => {
                return slot.id;
            });
            //also determine starting and end slot
            requiredSlots = requiredSlots.sort((slot1, slot2) => {
                return slot1.slotNumber - slot2.slotNumber
            })
            let startSlot: DefaecoSlot = requiredSlots[0];
            let endSlot: DefaecoSlot = requiredSlots[requiredSlots.length - 1];

            let isSlotAvaialble = await this.checkIfAllRequiredSlotsAreAvailable(requiredSlotIds);
            if (isSlotAvaialble) {
                //save slots
                let batch = this.db.batch();
                const id = this.db.collection(DefaecoConstants.ENTITY_ORDER_OVERVIEW).doc().id;
                let serviceBookedNames: string = servicesTobeBooked.map((s) => { return s.name; }).join(",");
                //save the slots
                requiredSlots.map((slot: DefaecoSlot) => {
                    const slotId = `${slot.date}_${vendorOverview.vendorId}_${slot.bayNumber}_${slot.slotNumber}`;
                    slot.id = slotId;
                    slot.vendorId = vendorOverview.vendorId;
                    slot.orderId = id;
                    slot.servicesBooked = serviceBookedNames;
                    slot.bookedBy = user.email;
                    const slotTosave_pureObj = JSON.parse(JSON.stringify(slot));
                    const slotRef = this.db.collection(DefaecoConstants.slotCollection).doc(slotId)
                    batch.set(slotRef, slotTosave_pureObj);
                })
                //save the order
                const orderOverview = new OrderOverview();
                orderOverview.orderId = id;
                orderOverview.vendorId = vendorOverview.vendorId
                orderOverview.orderDate = slotDate.format(DefaecoConstants.DATE_FORMAT);
                orderOverview.orderTime = vendorOverview.convertSlotNumberToTime(startingSlot);
                orderOverview.orderEndDate = endSlot.date;
                orderOverview.orderEndDate = vendorOverview.convertSlotNumberToTime(endSlot.slotNumber);
                orderOverview.slotIds = requiredSlotIds;
                orderOverview.orderAmount = finalPriceWithTax;
                orderOverview.status = OrderStatus.ACTIVE;
                orderOverview.bookedBy = user.uid;
                orderOverview.bookedOn = Date.now();
                orderOverview.vehicleTypeCode = vehicleType;
                orderOverview.modifiedOn = Date.now();
                orderOverview.couponApplied = couponApplied;
                orderOverview.couponCode = couponCode;
                orderOverview.amountPaid = finalPriceWithTax;
                orderOverview.discountAmount = discountTobeApplied;
                orderOverview.customerName = customerName;
                orderOverview.customerContactNumber = customerContactNumber;
                orderOverview.isPremium = isPremium;

                let invlovedEmails: string[] = [];
                let invlovedMobiles: string[] = [];
                let comments: string[] = [];
                //condtion 1
                if (user.email == DefaecoConstants.ADMIN_EMAIL) {
                    invlovedEmails = [vendorOverview.emailId];
                    invlovedMobiles = [];
                    let timeNow: moment.Moment = moment(momentTz().tz("Asia/Kolkata"));
                    let dateTimeStr = timeNow.format(DefaecoConstants.DATE_FORMAT + " " + DefaecoConstants.TIME_FORMAT);
                    comments.push(`Order created by Admin at ${dateTimeStr}`);
                }
                //condition 2
                if (isRequestFromVendor) {
                    invlovedEmails = [vendorOverview.emailId];
                    invlovedMobiles = [vendorOverview.contactNumber];
                    let timeNow: moment.Moment = moment(momentTz().tz("Asia/Kolkata"));
                    let dateTimeStr = timeNow.format(DefaecoConstants.DATE_FORMAT + " " + DefaecoConstants.TIME_FORMAT);
                    comments.push(`Order created by Vendor at ${dateTimeStr}`);
                }
                //condtion 3
                if (user.email != DefaecoConstants.ADMIN_EMAIL && !isRequestFromVendor) {
                    invlovedEmails = [vendorOverview.emailId, user.email];
                    invlovedMobiles = [customerContactNumber];
                }

                orderOverview.invlovedEmails = invlovedEmails;
                orderOverview.invlovedMobiles = invlovedMobiles;

                const orderDetails = new OrderDetails();
                orderDetails.comments = comments;
                orderDetails.orderId = id;
                orderDetails.modifiedOn = Date.now();
                orderDetails.servicePackages = servicesTobeBooked;

                const orderRef = this.db.collection(DefaecoConstants.ENTITY_ORDER_OVERVIEW).doc(id);
                const orderDetailRef = this.db.collection(DefaecoConstants.ENTITY_ORDER_DETAILS).doc(id);
                batch.set(orderRef, orderOverview.toFirestoreObj());
                batch.set(orderDetailRef, orderDetails.toFirestoreObj());
                await batch.commit();
                let slotTimeMin = (startingSlot * vendorOverview.slotDurationInMinutes);
                let startingTimeMin = (vendorOverview.workStartHours * 60);
                let totalTimeThatDayInMin = slotTimeMin + startingTimeMin - 60 //- 1 hr
                let bookingDateInMilli: number = moment(date, DefaecoConstants.DATE_FORMAT).valueOf();
                let totalTime = bookingDateInMilli + (totalTimeThatDayInMin * 60000);
                //try{await this.nms.addNotification(totalTime,AppNotificationType.OR,orderOverview.orderId,user.uid,true); }catch(e){}
                response.isError = false;
                response.data = { 'orderId': id };
            } else {
                throw new Error("Invalid Slot");
            }
            console.timeEnd();

        } catch (e) {
            response.isError = true;
            response.errorMsg = e.message;
        }
        return response;
    }
    public async cancelOrder(orderId: string, user: any) {
        let response: DefaecoEntityResponse = new DefaecoEntityResponse();
        try {
            const cutOffTime: number = 86400000; //24 hours in milliseconds
            let isrefund = true;
            let order: OrderOverview = new OrderOverview();
            let orderDetails: OrderDetails = new OrderDetails();
            let orderPromise = order.getById(this.db, orderId, user);
            let orderDetailsPromise = orderDetails.getById(this.db, orderId);
            let ordersResult = await Promise.all([orderPromise, orderDetailsPromise]);
            order = ordersResult[0];
            orderDetails = ordersResult[1];
            if(order.status != OrderStatus.ACTIVE){
                throw new Error("Can not Cancel Non active orders");
            }
            const servicetimeIST: moment.Moment = moment(`${order.orderDate} ${order.orderTime}`, `${DefaecoConstants.DATE_FORMAT} ${DefaecoConstants.TIME_FORMAT}`);
            const currentDateTimeIST: moment.Moment = moment(momentTz().tz("Asia/Kolkata"));
            const diff = servicetimeIST.valueOf() - currentDateTimeIST.valueOf();
            isrefund = diff < cutOffTime ? false : true;
            let batch = this.db.batch();
            //delete the slots
            for (let i = 0; i < order.slotIds.length; i++) {
                const slotRef = this.db.collection(DefaecoConstants.slotCollection).doc(order.slotIds[i])
                batch.delete(slotRef);
            }
            //update the order
            order.status = OrderStatus.CANCELED;
            order.isRefund = isrefund;
            order.bookedOn = Date.now();
            order.modifiedOn = Date.now();
            if (user.email == DefaecoConstants.ADMIN_EMAIL) {
                let timeNow: moment.Moment = moment(momentTz().tz("Asia/Kolkata"));
                let dateTimeStr = timeNow.format(DefaecoConstants.DATE_FORMAT + " " + DefaecoConstants.TIME_FORMAT);
                orderDetails.comments = orderDetails.comments ? orderDetails.comments : [];
                orderDetails.comments.push(`Order canceled by Admin at ${dateTimeStr}`);
            }
            const orderRef = this.db.collection(DefaecoConstants.ENTITY_ORDER_OVERVIEW).doc(order.orderId);
            const orderDetailsRef = this.db.collection(DefaecoConstants.ENTITY_ORDER_DETAILS).doc(order.orderId);
            batch.set(orderRef, order.toFirestoreObj());
            batch.set(orderDetailsRef, orderDetails.toFirestoreObj());
            await batch.commit();
            response.isError = false;
            response.data = {
                'msg': isrefund ? "canceled with refund" : "canceled without refund"
            }

        } catch (e) {
            console.log("Unhandled Error", e);
            response.isError = true;
            response.errorMsg = e.message;
        }

        return response;
    }
    public async closeOrder(orderId: string, user: any) {
        let response: DefaecoEntityResponse = new DefaecoEntityResponse();
        try {
            let order: OrderOverview = new OrderOverview();
            let orderDetails: OrderDetails = new OrderDetails();
            let orderPromise = order.getById(this.db, orderId, user);
            let orderDetailsPromise = orderDetails.getById(this.db, orderId);
            let ordersResult = await Promise.all([orderPromise, orderDetailsPromise]);
            order = ordersResult[0];
            orderDetails = ordersResult[1];
            if (order.status != OrderStatus.ACTIVE) {
                throw new Error("Can not Close Non active orders");
            }
            if (!(order.vendorId == user.uid || user.email == DefaecoConstants.ADMIN_EMAIL)) {
                throw new Error("Unauthorized : Not a valid vendor");
            }
            let batch = this.db.batch();

            //update the order
            order.status = OrderStatus.COMPELETED;
            order.bookedOn = (new Date()).getTime();
            order.modifiedOn = Date.now();
            if (user.email == DefaecoConstants.ADMIN_EMAIL) {
                let timeNow: moment.Moment = moment(momentTz().tz("Asia/Kolkata"));
                let dateTimeStr = timeNow.format(DefaecoConstants.DATE_FORMAT + " " + DefaecoConstants.TIME_FORMAT);
                orderDetails.comments = orderDetails.comments ? orderDetails.comments : [];
                orderDetails.comments.push(`Order closed by Admin at ${dateTimeStr}`);
            }

            const orderRef = this.db.collection(DefaecoConstants.ENTITY_ORDER_OVERVIEW).doc(order.orderId);
            const orderDetailsRef = this.db.collection(DefaecoConstants.ENTITY_ORDER_DETAILS).doc(order.orderId);
            batch.set(orderRef, order.toFirestoreObj());
            batch.set(orderDetailsRef, orderDetails.toFirestoreObj());
            await batch.commit();
            response.isError = false;
            response.data = {
                'msg': "Order successfully closed"
            }
        } catch (e) {
            console.log("Error", e);
            response.isError = true;
            response.errorMsg = e.message;
        }
        return response;
    }
    public async reopenOrder(orderId: string, user: any) {
        let response: DefaecoEntityResponse = new DefaecoEntityResponse();
        try {
            if (user.email != DefaecoConstants.ADMIN_EMAIL) {
                throw new Error("Unauthorized : Not authorized to perform this operation(Admin only)");
            }
            let order: OrderOverview = new OrderOverview();
            let orderDetails: OrderDetails = new OrderDetails();
            let orderPromise = order.getById(this.db, orderId, user);
            let orderDetailsPromise = orderDetails.getById(this.db, orderId);
            let ordersResult = await Promise.all([orderPromise, orderDetailsPromise]);
            order = ordersResult[0];
            orderDetails = ordersResult[1];

            if(order.status != OrderStatus.COMPELETED){
                throw new Error("Error : Can not reopen uncompleted order");
            }

            let batch = this.db.batch();
            //update the order
            order.status = OrderStatus.ACTIVE;
            order.bookedOn = (new Date()).getTime();
            order.modifiedOn = Date.now();

            if (user.email == DefaecoConstants.ADMIN_EMAIL) {
                let timeNow: moment.Moment = moment(momentTz().tz("Asia/Kolkata"));
                let dateTimeStr = timeNow.format(DefaecoConstants.DATE_FORMAT + " " + DefaecoConstants.TIME_FORMAT);
                orderDetails.comments = orderDetails.comments ? orderDetails.comments : [];
                orderDetails.comments.push(`Order reopened by Admin at ${dateTimeStr}`);
            }
            const orderRef = this.db.collection(DefaecoConstants.ENTITY_ORDER_OVERVIEW).doc(order.orderId);
            const orderDetailsRef = this.db.collection(DefaecoConstants.ENTITY_ORDER_DETAILS).doc(order.orderId);
            batch.set(orderRef, order.toFirestoreObj());
            batch.set(orderDetailsRef, orderDetails.toFirestoreObj());
            await batch.commit();
            response.isError = false;
            response.data = {
                'msg': "Order successfully reopened by admin"
            }
        } catch (e) {
            console.log("Error", e);
            response.isError = true;
            response.errorMsg = e.message;
        }
        return response;

    }
    public async resechduleOrder(orderId: string,vendorId:string,newStartingSlot: number,newBayIndex:number,newDate:string, user: any){
        let response: DefaecoEntityResponse = new DefaecoEntityResponse();
        try {
            const cutOffTime:number = 86400000; //24 hours in milliseconds
            let order: OrderOverview = new OrderOverview();
            let orderDetails: OrderDetails = new OrderDetails();
            let vendor:VendorOverview = new VendorOverview();
            let orderPromise = order.getById(this.db, orderId, user);
            let orderDetailsPromise = orderDetails.getById(this.db, orderId);
            let vendorOverviewPromise = vendor.getById(this.db,vendorId);
            let ordersResult = await Promise.all([orderPromise, orderDetailsPromise,vendorOverviewPromise]);
            order = ordersResult[0];
            orderDetails = ordersResult[1];
            vendor = ordersResult[2];
            const currentDateTimeIST:moment.Moment = moment(momentTz().tz("Asia/Kolkata"));
            const servicetimeIST:moment.Moment = moment(`${order.orderDate} ${order.orderTime}`,`${DefaecoConstants.DATE_FORMAT} ${DefaecoConstants.TIME_FORMAT}`);
            const diff = servicetimeIST.valueOf() - currentDateTimeIST.valueOf();
            //const newOrderDate:moment.Moment = moment(newDate,DefaecoConstants.DATE_FORMAT);
            let totalSlotRequired:number = order.slotIds.length;

            let baysList:number[] = vendor.getBaysList(order.isPremium);
            if(baysList.indexOf(newBayIndex) < 0){
               throw new Error("Invalid Bay");
            }
            if (diff < cutOffTime) {
                throw new Error("Can not resechdule After cut off time");
            }
            if(order.isRescheduled){
                throw new Error("Can not resechdule, as it is been already rescheduled");
            }
            if(order.couponApplied){
                throw new Error("Can not resechdule, as coupon is applied");
            }
            if(vendor.checkIfGivenDayIsSpecialDay(newDate)){
                throw new Error("Can not resechdule, as given day is a special day");
            }
            if(order.bookedBy != user.uid){
                throw new Error("Unauthorized : Order is not booked by you");
            }
            let requiredSlotsResp:DefaecoEntityResponse = this.getAllRequiredSlots(newDate,newStartingSlot,newBayIndex+"",vendor,totalSlotRequired,order.isPremium,order.orderAmount)
            if(requiredSlotsResp.isError){return requiredSlotsResp;}
            
            let requiredSlots:DefaecoSlot[] = requiredSlotsResp.data;
            let requiredSlotIds:string[] = requiredSlots.map((slot:DefaecoSlot)=>{
                return slot.id;
            });
             //also determine starting and end slot
            requiredSlots = requiredSlots.sort((slot1,slot2)=>{
                return slot1.slotNumber - slot2.slotNumber
            })
            let startSlot:DefaecoSlot = requiredSlots[0];
            let endSlot:DefaecoSlot = requiredSlots[requiredSlots.length-1];
            let isSlotAvaialble = await this.checkIfAllRequiredSlotsAreAvailable(requiredSlotIds);
            if(isSlotAvaialble){
                let batch = this.db.batch();
                //delete the old slots
                order.slotIds.map((slotId)=>{
                    const slotRef = this.db.collection(DefaecoConstants.slotCollection).doc(slotId)
                    batch.delete(slotRef);
                })
                //save the  new slots
                requiredSlots.map((slot:DefaecoSlot)=>{
                    const slotId = `${slot.date}_${vendor.vendorId}_${slot.bayNumber}_${slot.slotNumber}`;
                    slot.id = slotId;
                    slot.vendorId = vendor.vendorId;
                    slot.orderId = order.orderId;
                    slot.servicesBooked = 'change it';
                    slot.bookedBy = user.email;
                    const slotTosave_pureObj = JSON.parse(JSON.stringify(slot));
                    const slotRef = this.db.collection(DefaecoConstants.slotCollection).doc(slotId)
                    batch.set(slotRef, slotTosave_pureObj);
                 })
                //update the order
                order.orderDate = newDate;
                order.orderTime = vendor.convertSlotNumberToTime(startSlot.slotNumber);
                order.orderEndDate = endSlot.date;
                order.orderEndDate = vendor.convertSlotNumberToTime(endSlot.slotNumber);
                order.slotIds = requiredSlotIds;
                order.isRescheduled = true;
                order.modifiedOn = Date.now();
                const orderRef = this.db.collection(DefaecoConstants.ENTITY_ORDER_OVERVIEW).doc(order.orderId);
                //const orderDetailRef = this.db.collection(DefaecoConstants.ENTITY_ORDER_DETAILS).doc(order.orderId);
                batch.update(orderRef, order.toFirestoreObj());
                //batch.set(orderDetailRef, orderDetails.toFirestoreObj());
                await batch.commit();
                response.isError = false;
                response.data = {
                    'msg': "Order successfully rescheduled"
                }
            }else{
               throw new Error("Invalid Slot")
            }
        } catch (e) {
            console.log("Unhandled Error", e);
            response.isError = true;
            response.errorMsg = e.message;
        }

        return response;
    }
    public async saveOrderFeedback(orderId: string, rating: number, comments: string, user: any) {
        let response: DefaecoEntityResponse = new DefaecoEntityResponse();
        try {
            rating = parseFloat(`${rating}`);
            let order: OrderOverview = new OrderOverview();
            let orderDetails: OrderDetails = new OrderDetails();
            let orderPromise = order.getById(this.db, orderId, user);
            let orderDetailsPromise = orderDetails.getById(this.db, orderId);
            let ordersResult = await Promise.all([orderPromise, orderDetailsPromise]);
            order = ordersResult[0];
            orderDetails = ordersResult[1];
            if(order.bookedBy != user.uid){
                throw new Error("Unauthorized : Not Authrorized to perform this action");
            }
            if(order.status != OrderStatus.COMPELETED){
                throw new Error("Error : Can not rate unclosed order");
            } 
            if(order.isRatted){
                throw new Error("Error : Feedback already given");
            } 
            orderDetails.feedbackComments = comments;
            orderDetails.rating = rating
            if(!orderDetails.validateFeedback()){
                throw new Error("Invalid Request : Validation Error");
            }
             //save order
             order.isRatted = true;
             let batch = this.db.batch();
             const orderRef = this.db.collection(DefaecoConstants.ENTITY_ORDER_OVERVIEW).doc(order.orderId);
             const orderDetailsRef = this.db.collection(DefaecoConstants.ENTITY_ORDER_DETAILS).doc(order.orderId);
             batch.set(orderRef, order.toFirestoreObj());
             batch.set(orderDetailsRef, orderDetails.toFirestoreObj());
             //update the vendor
            let vendor:VendorOverview = new VendorOverview();
            vendor = await vendor.getById(this.db,order.vendorId);
            vendor.noOfRatings = vendor.noOfRatings + 1;
            vendor.ratting = (vendor.ratting + rating) / 2;
            const vendorRef= this.db.collection(DefaecoConstants.ENTITY_VENDOR_OVERVIEW).doc(vendor.vendorId);
            batch.set(vendorRef,vendor.toFirestoreObj());
            await batch.commit();
            response.isError = false;
            response.data ={'msg':'Feedback successfully added'} ;
        } catch (e) {
            console.log("Error", e);
            response.isError = true;
            response.errorMsg = e.message;
        }
        return response;
    }
    //#region  Helper methods
    private async checkIfAllRequiredSlotsAreAvailable(requiredSlotIds:string[]):Promise<boolean>{
        let chunkedArrayOfArray = this.chunchArray(requiredSlotIds,10); //as 10 is the limit for in query
        //console.log(chunkedArrayOfArray);
        let queryPromiseArray:Promise<any>[] = [];
        chunkedArrayOfArray.map((arrayOf10:string[])=>{
          let queryPromise = this.db.collection(DefaecoConstants.slotCollection).where('id', 'in', arrayOf10).get();
          queryPromiseArray.push(queryPromise);
    
        });
       let results = await Promise.all(queryPromiseArray);
       let resultsEmpty = true;
       results.map((result)=>{
        resultsEmpty = resultsEmpty && result.empty ? true : false;
       });

       return resultsEmpty; //if results are empty then slots are available or else not


    }
    private chunchArray(inputArray:any[],size:number):any[]{
        const chunked_arr = [];
          let index = 0;
          while (index < inputArray.length) {
            chunked_arr.push(inputArray.slice(index, size + index));
            index += size;
          }
          return chunked_arr;
    }
    private getAllRequiredSlots(day:string,startingSlotNumber:number,bayNumber:string,vendor:VendorOverview,noOfSlotsRequired:number,isPremium:boolean,packagePrice:number):DefaecoEntityResponse{
        let resp:DefaecoEntityResponse = new DefaecoEntityResponse();
        let noOfSlotsPerDay = vendor.getNoOfSlotsPerDay();
        let slotDate:moment.Moment = moment(day,DefaecoConstants.DATE_FORMAT);
        let nextDay:moment.Moment|null =vendor.getValidNextDay(slotDate);
        let baysList:number[] = vendor.getBaysList(isPremium);
        if(baysList.indexOf(+bayNumber) < 0){
            resp.isError = true;
            resp.errorMsg = "Invalid Bay";
            return resp;
        }
        let validationResp:DefaecoEntityResponse = vendor.validateSlot(startingSlotNumber,slotDate);
        if(validationResp.isError){
            return validationResp;
        }
        let allRequiredSlots:DefaecoSlot[] = [];
        let requiredSlotNumbers = [];
        for(let k=startingSlotNumber;k< startingSlotNumber + noOfSlotsRequired;k++){
            let currentSlotNumber = k+0; //to make a copy
            let currentSlotDate = slotDate;
            if(currentSlotNumber>=noOfSlotsPerDay && nextDay){ //for non premium slots slot number will increase sequencialy
                if(isPremium){
                    currentSlotDate = nextDay;
                    currentSlotNumber = currentSlotNumber-noOfSlotsPerDay;
                }else{
                    break;
                } 
            }
            if(vendor.breakSlots.indexOf(currentSlotNumber) > -1 || requiredSlotNumbers.indexOf(currentSlotNumber)>-1){
                while(vendor.breakSlots.indexOf(currentSlotNumber) > -1 || requiredSlotNumbers.indexOf(currentSlotNumber)>-1){
                    currentSlotNumber++;
                    if(currentSlotNumber >= noOfSlotsPerDay){
                        break;
                    }
                }
            }
            requiredSlotNumbers.push(currentSlotNumber);
            let slot:DefaecoSlot = DefaecoSlot.getSlotObj(currentSlotDate,+bayNumber,currentSlotNumber,vendor);
            slot.price = packagePrice;
            allRequiredSlots.push(slot);
        }
    
        if(allRequiredSlots.length != noOfSlotsRequired){
            resp.isError = true;
            resp.errorMsg = "Invalid Slot, End slot exceed working hours";
            return resp;
        }
        resp.isError = false;
        resp.data = allRequiredSlots;
        return resp;
    }
    //#endregion
}
/**
 * VendorOverview is the base class every other class are specific class which extends this class
 * Only exception is VendorDetailsForListing Page which has duplicate data of overivew, so when we create or update this has to be taken care of
 *ownerName contactNumber latitude longitude geoHash workStartHours
 */
export class VendorOverview{
    vendorName: string = "";
    vendorId: string = "";
    ownerName: string = "";
    contactNumber: string = "";
    latitude: number = 0;
    longitude: number = 0;
    geoHash: string = "";
    emailId: string = "";
    workStartHours: number = 8.5;
    workEndHours: number = 20;
    slotDurationInMinutes: number = 60;
    numberOfBays: number = 3;
    numberOfPremiumBays: number = 0;
    ratting:number = 5;
    noOfRatings:number = 1;
    dpUrl:string="";
    isBlocked?:boolean = false;
    weeklyOff:number[] = []; // Sunday - Saturday : 0 - 6 date.getDay();
    specialDays:string[] = [] //["17-02-2020","09-02-2020","23-02-2020"],
    breakSlots:number[] =[] //[20,21,22,23]
    createdOn:number=0;
    modifiedOn:number =0;
    areaName:string = ""; //Primary area of the vendor, this field is shown in the ui for users
    toFirestoreObj(){
      return JSON.parse(JSON.stringify(this));
     
    }
    validateEntity(): DefaecoEntityResponse {
        this.modifiedOn = Date.now();
        let resp: DefaecoEntityResponse = new DefaecoEntityResponse();
        if (!this.isValidaVendorName()) {
            resp.isError = true;
            resp.errorMsg = 'Invalid Vendor Name';
            return resp;
        } else if (!this.isValidContactNumber()) {
            resp.isError = true;
            resp.errorMsg = 'Invalid Contact Number';
            return resp;
        } else {
            resp.isError = false;
        }
        return resp;
    }
    private isValidaVendorName(){
        return this.vendorName && this.vendorName.length > 3 ? true : false;
    }
    private isValidContactNumber(){
        return this.vendorName && this.contactNumber.length >= 10 ? true : false;
    }
    getBaysList(isPremium:boolean){
        let baysToLookFor:number[] = [];
        for(let i=0;i<this.numberOfBays;i++){
            baysToLookFor.push(i);
        }
        if(isPremium){
            baysToLookFor.splice(0,this.numberOfBays-this.numberOfPremiumBays)
        }
        return baysToLookFor;
    }
    getNoOfSlotsPerDay():number{
        return (this.workEndHours - this.workStartHours) / (this.slotDurationInMinutes/60);
    }
    getValidNextDay(slotDate: moment.Moment): moment.Moment | null {
        let nextDay: moment.Moment = slotDate.clone().add(1, 'days');
        let isValidNextDay = false;
        for (let i = 0; i < 7; i++) {
            let dayOfTheWeek = nextDay.toDate().getDay();
            if (this.weeklyOff.indexOf(dayOfTheWeek) == -1) {
                isValidNextDay = true;
                break;
            }
            nextDay.add('days', 1); //add next day if it is weekly off.
        }
        return isValidNextDay ? nextDay : null;
    }
    convertSlotNumberToTime(slotNumber:number){
        let timeStr = '-';
        let noOfSlotsPerDay = this.getNoOfSlotsPerDay();
        if(slotNumber < noOfSlotsPerDay){
            let slotTime = this.workStartHours + ((this.slotDurationInMinutes/60) * slotNumber);
            let slotTimeInMinute = slotTime * 60;
            let currentDateTimeIST:moment.Moment = moment(momentTz().tz("Asia/Kolkata"));
            let hours = Math.floor(slotTimeInMinute / 60); //60 min = 1 hr
            let minutes = slotTimeInMinute % 60; //remainder of 60
            currentDateTimeIST.hour(hours);
            currentDateTimeIST.minutes(minutes);
            timeStr = currentDateTimeIST.format('hh:mm a');
        }
        return timeStr;
    }
    checkIfGivenDayIsSpecialDay(date:string){
        return this.specialDays.indexOf(date) > -1 ? true : false;
    }
    validateSlot(slotNumber:number,slotDate:moment.Moment):DefaecoEntityResponse{
    let resp:DefaecoEntityResponse = new DefaecoEntityResponse();
    let currentDateTimeIST:moment.Moment = moment(momentTz().tz("Asia/Kolkata"));
    let noOfSlotsPerDay = this.getNoOfSlotsPerDay();

    if(this.breakSlots.indexOf(slotNumber) > -1){ //break time check
        resp.isError = true;
        resp.errorMsg = `Invalid Slot : Break Time`;
    } 
    else if(slotDate.isBefore(currentDateTimeIST,'day')){//validate for past dates, slot dates should be future date
        resp.isError = true;
        resp.errorMsg = `Invalid Slot :  past Date slot, requested Date is ${slotDate} and  current Date is ${currentDateTimeIST}`;
    } 
    else if(currentDateTimeIST.isSame(slotDate,'day')){//today and current time validation
        let hour = currentDateTimeIST.hours(); //in 24 hours format
        let minutes = currentDateTimeIST.minutes();
        let timeInMinutes = (hour * 60) + minutes;
        let requiredSlotTimeInMinutes = (this.workStartHours * 60) + (slotNumber * this.slotDurationInMinutes);
        if(requiredSlotTimeInMinutes <= timeInMinutes){
            resp.isError = true;
            resp.errorMsg = `Invalid Slot : past time slot, requested time is ${requiredSlotTimeInMinutes/60} and time right now is ${timeInMinutes/60}`;
        } 
    } 
    else if(slotNumber < 0 || slotNumber >= noOfSlotsPerDay){ //validate slot number
        resp.isError = true;
        resp.errorMsg = `Invalid Slot :Slot Number should be b/w 0 and ${noOfSlotsPerDay-1}`;
    } 
    else if(this.weeklyOff.indexOf(slotDate.toDate().getDay()) > -1){ 
        //if given day is weekly off then return flase
        resp.isError = true;
        resp.errorMsg = `Invalid Slot :Given day is Weekly off`;
    }
    return resp;
    }
    async getById(db,vendorId:string):Promise<VendorOverview>{
        let querySnapshot = await db.collection(DefaecoConstants.ENTITY_VENDOR_OVERVIEW).doc(vendorId).get();
        if (!querySnapshot.empty) {
            let vendor:VendorOverview = querySnapshot.data() as VendorOverview;
            if(vendor && !vendor.isBlocked){
                return Object.assign(new VendorOverview(), vendor); //return instance insted of object
                //return vendor;
            }else{
                throw new Error('No vendor found');
            }  
        }else{
            throw new Error('No vendor found'); 
        }

    }
    async getVendorByEmail(db,emailId:string):Promise<VendorOverview[]>{
        let querySnapshot = await db.collection(DefaecoConstants.ENTITY_VENDOR_OVERVIEW).where("emailId", "==", emailId).get();
        let matchedVendors:VendorOverview[]=[];
        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc: any) => {
                let vendor: VendorOverview = doc.data() as VendorOverview;
                vendor =  Object.assign(new VendorOverview(), vendor); //return instance insted of object
                matchedVendors.push(vendor);
            });
            return matchedVendors;
        }else{
            throw new Error('No vendor found'); 
        }
    }
    async getVendorByMobileNumber(db,mobileNumber:string):Promise<VendorOverview[]>{
        let querySnapshot = await db.collection(DefaecoConstants.ENTITY_VENDOR_OVERVIEW).where("contactNumber", "==", mobileNumber).get();
        let matchedVendors:VendorOverview[]=[];
        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc: any) => {
                let vendor: VendorOverview = doc.data() as VendorOverview;
                vendor =  Object.assign(new VendorOverview(), vendor); //return instance insted of object
                matchedVendors.push(vendor);
            });
            return matchedVendors;
        }else{
            throw new Error('No vendor found'); 
        }

    }
}
export class VendorDetails{
    vendorId: string = "";

    amenities: string[] = [];
    servicesOffered: string[] = []; //list of services, this field is shown in the ui for users
    companyProfile?:string = "";

    validateEntity(): DefaecoEntityResponse {
        let resp: DefaecoEntityResponse = new DefaecoEntityResponse();
        if (this.companyProfile.length > 1000) {
            resp.isError = true;
            resp.errorMsg = 'Invalid companyProfile : Should be less than 1000 characters';
            return resp;
        } else {
            resp.isError = false;
        }
        return resp;
    }
    toFirestoreObj(){
      return JSON.parse(JSON.stringify(this));
     
    }


}
export class VendorDetailsForListing{
    vendorId: string = "";

    distnaceFromCenter:number = 0;
    areaName:string = "";
    keywords:string[] = [];
    vendorName: string = "";
    ownerName: string = "";
    contactNumber: string = "";
    emailId: string = "";
    dpUrl:string="";
    ratting:number = 5;
    noOfRatings:number = 1;

    private getSearchKeywordsForVendor(vendor: VendorOverview):string[]{
        const nameKWs = vendor.vendorName?vendor.vendorName.split(' ') : [];
        //const addressKW = vendor.address ? vendor.address.split(' ') : [];
        const areaNameKW = vendor.areaName ? vendor.areaName.split(' ') : [];
        //const serviceArray = vendor.servicesOffered ? vendor.servicesOffered : [];
        //const serviceArrayStr = serviceArray.join(" ");
        //const serviceOfferedKW = serviceArrayStr ? serviceArrayStr.split(' ') : [];
        //const allKeywords = nameKWs.concat(addressKW).concat(areaNameKW).concat(serviceOfferedKW);
        const allKeywords = nameKWs.concat(areaNameKW);
        let uniqueKWsArray = allKeywords.filter((item, pos) => { return allKeywords.indexOf(item) == pos;});
        let uniqueKWsArray_lc:string[] = [];
        for(let i=0;i<uniqueKWsArray.length;i++){
            uniqueKWsArray_lc.push(uniqueKWsArray[i].toLowerCase())//to lowercase
            let tokens:any = uniqueKWsArray[i].match(/.{1,3}/g);//if the length if greater than 3 then split into tokens of length 3
            tokens =tokens?tokens:[];
            for(let j=0;j<tokens.length;j++){
                if(tokens[j].length >2){
                    uniqueKWsArray_lc.push(tokens[j].toLowerCase());
                }
            }
        }
        return uniqueKWsArray_lc;
    }

    private updateWithOverview(overview:VendorOverview){
        this.vendorName = overview.vendorName;
        this.ownerName = overview.ownerName;
        this.contactNumber = overview.contactNumber;
        this.emailId = overview.emailId;
        this.dpUrl = overview.dpUrl;
        this.ratting = overview.ratting;
        this.noOfRatings = overview.noOfRatings;
        this.areaName = overview.areaName;
        this.distnaceFromCenter = 0;
        this.keywords = this.getSearchKeywordsForVendor(overview);
    }
    validateEntity(overview:VendorOverview): DefaecoEntityResponse {
        let resp: DefaecoEntityResponse = new DefaecoEntityResponse();
        this.updateWithOverview(overview);
        resp.isError = false;
        return resp;
    }
    toFirestoreObj(){
      return JSON.parse(JSON.stringify(this));
     
    }

}
export class VendorContactDetails{
    vendorId: string = "";

    address: string = "";
    contactNumber1: string = "";
    contactNumber2: string = "";
    city: string = "";
    state: string = "";
    country: string = "";
    emailId1: string = "";
    emailId2: string = "";
    website: string = "";
    gmapsLink:string="https://goo.gl/maps/BdM8QJSgGgMkb1ZZA"; //gmaps > slect place > click on share to get the link

    validateEntity(): DefaecoEntityResponse {
        let resp: DefaecoEntityResponse = new DefaecoEntityResponse();
        if (this.address.length > 1000) {
            resp.isError = true;
            resp.errorMsg = 'Invalid address : Should be less than 1000 characters';
            return resp;
        }else if (this.contactNumber1.length > 10) {
            resp.isError = true;
            resp.errorMsg = 'Invalid contactNumber1 : Should be less than or equal 10 characters';
            return resp;
        }else if (this.contactNumber2.length > 10) {
            resp.isError = true;
            resp.errorMsg = 'Invalid contactNumber2 : Should be less than or equal 10 characters';
            return resp;
        }else {
            resp.isError = false;
        }
        return resp;
    }
    toFirestoreObj(){
      return JSON.parse(JSON.stringify(this));
     
    }

}
export class VendorBankingDetails{
    vendorId: string = "";

    GSTN: string = "";
    bankNumber: string = "";
    IFSCCode: string = "";
    accountNumber: string = "";

    validateEntity(): DefaecoEntityResponse {
        let resp: DefaecoEntityResponse = new DefaecoEntityResponse();
        resp.isError = false;
        return resp;
    }
    toFirestoreObj(){
      return JSON.parse(JSON.stringify(this));
     
    }
}
export class VendorServicePackage{
    vendorId: string = "";
    servicePackages: ServicePackage[] = [];
    validateEntity(): DefaecoEntityResponse {
        let resp: DefaecoEntityResponse = new DefaecoEntityResponse();
        resp.isError = false;
        return resp;
    }
    toFirestoreObj(){
      return JSON.parse(JSON.stringify(this));
     
    }
    static async getById(db,vendorId:string):Promise<VendorServicePackage>{
        let querySnapshot = await db.collection(DefaecoConstants.ENTITY_VENDOR_SERVICE_PACKAGE).doc(vendorId).get();
        if (!querySnapshot.empty) {
            let vendor:VendorServicePackage = querySnapshot.data() as VendorServicePackage;
            if(vendor){
                return vendor;
            }else{
                throw new Error('No vendor found');
            }
             
        }else{
            throw new Error('No vendor found'); 
        }

    }
}
export class VendorCoupon{
    vendorId: string = "";
    coupon:any={};
    validateEntity(): DefaecoEntityResponse {
        let resp: DefaecoEntityResponse = new DefaecoEntityResponse();
        resp.isError = false;
        return resp;
    }
    isCouponApplicable(couponCode:string,slotDate:moment.Moment){
        let isCouponApplicable = false;
        if(this.coupon && this.coupon.code && couponCode && this.coupon.code.toLowerCase() === couponCode.toLowerCase() ){
            const couponExpiresOn:moment.Moment = moment(momentTz(this.coupon.expiresOn).tz("Asia/Kolkata"));
            if(couponExpiresOn.isAfter(slotDate)){
                isCouponApplicable = true;
            }else{
                isCouponApplicable = false;
            }
        }
        return isCouponApplicable;
    }
    getDiscountAmount(totalPackagePrice:number):number{
        let discoutntamount = totalPackagePrice * (this.coupon.percentage / 100);
        let finalDiscount = discoutntamount > this.coupon.maxDiscount ? this.coupon.maxDiscount : discoutntamount;
        return finalDiscount;
    }
    toFirestoreObj(){
      return JSON.parse(JSON.stringify(this));
     
    }
    static async getById(db,vendorId){
        let querySnapshot = await db.collection(DefaecoConstants.ENTITY_VENDOR_COUPON).doc(vendorId).get();
        if (!querySnapshot.empty) {
            let vendor:VendorCoupon = querySnapshot.data() as VendorCoupon;
            if(vendor){
                vendor =  Object.assign(new VendorCoupon(), vendor); //return instance insted of object
                return vendor;
            }else{
                throw new Error('No VendorCoupon found');
            }
             
        }else{
            throw new Error('No VendorCoupon found'); 
        }
    }
}
export class OrderOverview {
    orderId: string="";
    orderAmount: number=0;
    discountAmount:number = 0;
    orderAmountAfterDiscount:number=0;
    amountPaid:number=0;
    vendorId: string="";
    status: string="";
    orderDate: string='';
    orderTime:string='';
    orderEndDate:string="";
    orderEndTime:string="";
    isRefund:boolean = false;
    isPremium:boolean = false;
    isRescheduled:boolean = false;
    vehicleTypeCode:string="";
    isRatted:boolean = false;
    feedbackId:string="";
    couponApplied:boolean = false;
    couponCode:string='';
    invlovedEmails:string[] = [];
    invlovedMobiles:string[] = [];
    customerName:string="";
    customerContactNumber:string="";
    slotIds: string[] = [];
    bookedBy: string="";
    bookedOn: number=0;
    modifiedOn:number=0;

    validateEntity(): DefaecoEntityResponse {
        let resp: DefaecoEntityResponse = new DefaecoEntityResponse();
        resp.isError = false;
        return resp;
    }
    toFirestoreObj(){
      return JSON.parse(JSON.stringify(this));
    }
    async getById(db,orderId:string,user:any){
        const orderDoc = await db.collection(DefaecoConstants.ENTITY_ORDER_OVERVIEW).doc(orderId).get();
        if(orderDoc.exists){
            let _order:OrderOverview = orderDoc.data();
            if(_order.bookedBy === user.uid || _order.vendorId === user.uid || user.email === DefaecoConstants.ADMIN_EMAIL){
                _order =  Object.assign(new OrderOverview(), _order); //return instance insted of object
                return  _order;
            }else{
                throw new Error("Invalid Order Id : Not Authorized");
            }
        }else{
            throw new Error("Invalid Order Id");
        }
    }
}
export class OrderDetails {
    orderId: string="";
    modifiedOn:number=0;
    servicePackages:ServicePackage[] = [];
    comments:string[] = [];
    rating:number = 0;
    feedbackComments:string = "";
    feedbackOn:string = "";

    validateEntity(): DefaecoEntityResponse {
        let resp: DefaecoEntityResponse = new DefaecoEntityResponse();
        resp.isError = false;
        return resp;
    }
    validateFeedback(){
        let isValidRating = this.rating >=0 && this.rating <=5 ? true:false;
        let isCommentValid = true;
        if(this.feedbackComments){
            isCommentValid = this.feedbackComments.length <=1000 ? true : false;
        }
        return isValidRating&&isCommentValid;
         
    }
    toFirestoreObj(){
      return JSON.parse(JSON.stringify(this));
    }
    async getById(db,orderId:string){
        const orderDoc = await db.collection(DefaecoConstants.ENTITY_ORDER_DETAILS).doc(orderId).get();
        if(orderDoc.exists){
            let _order:OrderDetails = orderDoc.data();
            _order =  Object.assign(new OrderDetails(), _order); //return instance insted of object
            return  _order;
           
        }else{
            throw new Error("Invalid Order Id");
        }
    }
}
export class DefaecoSlot{
    date:string;
    slotNumber:number = -1;
    bayNumber:number = -1;
    vendorId:string;
    id:string;
    price:number = 0;
    orderId:string;
    servicesBooked:string;
    bookedBy:string;

    static getSlotObj(slotDate:moment.Moment,bayNumber:number,slotNumber:number,vendor:VendorOverview):DefaecoSlot {
        let requiredSlotId:string = `${slotDate.format(DefaecoConstants.DATE_FORMAT)}_${vendor.vendorId}_${bayNumber}_${slotNumber}`;
        let slot:DefaecoSlot = new DefaecoSlot();
        slot.bayNumber = bayNumber;
        slot.date = slotDate.format(DefaecoConstants.DATE_FORMAT)
        slot.slotNumber = slotNumber;
        slot.vendorId = vendor.vendorId;
        slot.id = requiredSlotId;
        slot.price = 0;
        return slot;
    }

}

export class ServicePackage {
    code: string = "";
    name: string = "";
    description: string = "";
    priceConsole: any = {};
    isPremium: boolean = false;
    isAddOn: boolean = false;
    parents:string[] = [];

    constructor(code: string = "", name: string = "", description: string = "", isPremium: boolean = false, isAddOn: boolean = false) {
        this.code = code;
        this.name = name;
        this.description = description;
        this.isPremium = isPremium;
        this.isAddOn = isAddOn;
        this.parents = [];
        this.priceConsole['HB'] = new PriceConsole(0, 0,0, 'Hatchback', 'HB');
        this.priceConsole['SE'] = new PriceConsole(0, 0,0, 'Sedan', 'SE');
        this.priceConsole['SUV'] = new PriceConsole(0, 0,0, 'SUV', 'SUV');
        this.priceConsole['LMV'] = new PriceConsole(0, 0,0, 'LMV', 'LMV');
        this.priceConsole['TW'] = new PriceConsole(0, 0,0, 'Two Wheeler', 'TW');
    }
    getPackageSlots(vehicleType:string){
        let slots:number = 0;
        if(this.priceConsole && this.priceConsole[vehicleType]){
            slots = this.priceConsole[vehicleType].slotRequired; 
        }
        return slots;
    }
    getPackagePrice(vehicleType:string,isSpecialDay:boolean){
        let price:number = 0;
        if(this.priceConsole && this.priceConsole[vehicleType]){
            price = isSpecialDay ? this.priceConsole[vehicleType].specialPrice : this.priceConsole[vehicleType].price;
        }
        return price;
    }
    /**
     * Converts JSON to instance of this class
     */
    static toInstace(jsonObj){
       return Object.assign(new ServicePackage(), jsonObj);
    }
}
export class PriceConsole {
    slotRequired: number = 0;
    price: number = 0;
    specialPrice:number = 0;
    type: string = "";
    code: string = "";
    constructor(slotRequired?: number, price?: number,specialPrice?: number,type?: string, code?: string) {
        this.slotRequired = slotRequired ? slotRequired : 0;
        this.price = price ? price : 0;
        this.type = type ? type : '';
        this.code = code ? code : '';
        this.specialPrice = specialPrice ?specialPrice:0;
    }
}
export const enum OrderStatus {
    DRAFT = 'DRAFT',
    ACTIVE = 'ACTIVE',
    INPROGRESS = 'INPROGRESS',
    CANCELED = 'CANCELED',
    COMPELETED = 'COMPELETED'
}
export class AuthUser{
    uid:string="";
    displayName:string="";
    email:string = "";
}
export class DefaecoEntityResponse{
    isError:boolean = false;
    data:any;
    errorMsg:string=""
    errorObj:any;
}