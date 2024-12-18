"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Network,
  CreditCard,
  Timer,
  QrCode,
  Wifi,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "../lib/utils";

const App: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [selectedSubscription, setSelectedSubscription] = useState<any | null>(null);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "pending" | "success" | "failed">("idle");
  const [paymentTimeout, setPaymentTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchHotspot = async () => {
      try {
        const response = await api.get("/hotspot");
        setSubscriptions(response.data);
      } catch (error) {
        console.error("Error fetching hotspot data:", error);
      }
    };
    fetchHotspot();
  }, []);

  const handleSubscriptionSelect = (subscription: any) => {
    setSelectedSubscription(subscription);
    setIsPhoneModalOpen(true);
  };

  const handleProceedToPayment = async () => {
    if (!phoneNumber || !selectedSubscription) return;

    setPaymentStatus("pending");

    // Send the payment request to the endpoint
    try {
      await api.post("http://127.0.0.1:5600/payment", {
        phone_number: phoneNumber,
        hotspot_id: selectedSubscription.id,
      });

      // Start polling the payment status every minute
      let elapsedTime = 0;
      const intervalId = setInterval(async () => {
        try {
          const response = await api.get(
            `http://127.0.0.1:5600/payment?phone_number=${phoneNumber}`
          );
          const latestPayment = response.data.reduce((prev: any, current: any) => {
            return prev.id > current.id ? prev : current;
          });

          if (latestPayment.status === "success") {
            clearInterval(intervalId);
            setPaymentStatus("success");
          } else if (elapsedTime >= 5) {
            clearInterval(intervalId);
            setPaymentStatus("failed");
          } else {
            elapsedTime += 1;
          }
        } catch (error) {
          console.error("Error checking payment status:", error);
          clearInterval(intervalId);
          setPaymentStatus("failed");
        }
      }, 60000); // Poll every minute
      setPaymentTimeout(intervalId);
    } catch (error) {
      console.error("Error processing payment:", error);
      setPaymentStatus("failed");
    }
  };

  const formatDuration = (duration: number) => {
    if (duration < 60) {
      return `${duration} minutes`;
    } else if (duration >= 60 && duration < 1440) {
      return `${(duration / 60).toFixed(1)} hours`;
    } else {
      return `${(duration / 1440).toFixed(1)} days`;
    }
  };

  const renderSubscriptions = () => {
    const colorVariants = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-red-500"];

    return subscriptions.map((subscription, index) => (
      <Card
        key={subscription.id}
        className={`w-full max-w-sm mx-auto transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 ${colorVariants[index % colorVariants.length]}/20 hover:border-opacity-50`}
      >
        <CardHeader className="relative pb-0">
          <div
            className={`absolute top-0 right-0 p-2 ${colorVariants[index % colorVariants.length]} text-white rounded-bl-lg`}
          >
            <Network size={24} />
          </div>
          <CardTitle className="flex items-center space-x-2">
            <span>{subscription.name}</span>
          </CardTitle>
          <CardDescription>{subscription.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="flex justify-between items-center text-sm">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className="flex items-center">
                    <CreditCard className="mr-2 text-gray-500" size={16} />
                    Ksh {subscription.amount}
                  </span>
                </TooltipTrigger>
                <TooltipContent>Total plan cost</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <span className="flex items-center">
                    <Timer className="mr-2 text-gray-500" size={16} />
                    {formatDuration(subscription.hotspot_duration)}
                  </span>
                </TooltipTrigger>
                <TooltipContent>Plan duration</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Button
            onClick={() => handleSubscriptionSelect(subscription)}
            className={`w-full ${colorVariants[index % colorVariants.length]} hover:${colorVariants[index % colorVariants.length].replace("bg-", "bg-opacity-80 ")} text-white`}
          >
            Select Plan
          </Button>
        </CardContent>
      </Card>
    ));
  };

  const renderPaymentContent = () => {
    switch (paymentStatus) {
      case "idle":
        return (
          <div className="space-y-4">
            <Input
              placeholder="Enter M-Pesa Registered Phone Number 254XXXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full"
            />
            <Button
              onClick={handleProceedToPayment}
              disabled={!phoneNumber}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              Proceed to Payment
            </Button>
          </div>
        );
      case "pending":
        return (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="mr-2 h-16 w-16 animate-spin text-blue-500" />
            <p className="text-gray-700 text-center">
              Verifying payment...
              <br />
              Please wait while we process your request.
            </p>
          </div>
        );
      case "success":
        return (
          <div className="flex flex-col items-center space-y-4 text-green-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <p className="text-center">
              Payment Successful!
              <br />
              Your Wi-Fi access has been activated.
            </p>
            <Button
              onClick={() => {
                setIsPhoneModalOpen(false);
                setPaymentStatus("idle");
              }}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Close
            </Button>
          </div>
        );
      case "failed":
        return (
          <div className="flex flex-col items-center space-y-4 text-red-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p className="text-center">
              Payment Failed!
              <br />
              Please try again or contact support.
            </p>
            <div className="flex space-x-4">
              <Button
                onClick={() => setPaymentStatus("idle")}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Retry
              </Button>
              <Button
                onClick={() => setIsPhoneModalOpen(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                Close
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-blue-900 flex items-center justify-center gap-4">
            <Wifi size={48} className="text-blue-600" />
            Wi-Fi Access Portal
          </h1>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Seamless connectivity at your fingertips. Choose a plan and get
            instant network access.
          </p>
        </header>

        <div className="bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center">
            <Bell className="mr-4 text-blue-600" />
            How to Connect
          </h2>
          <ol className="space-y-4 text-gray-700">
            <li className="flex items-center">
              <span className="mr-4 text-2xl font-bold text-blue-500">1</span>
              Select a subscription plan from the options below
            </li>
            <li className="flex items-center">
              <span className="mr-4 text-2xl font-bold text-blue-500">2</span>
              Enter your M-Pesa registered phone number Format 254XXXXXXXXX
            </li>
            <li className="flex items-center">
              <span className="mr-4 text-2xl font-bold text-blue-500">3</span>
              Complete the payment via M-Pesa prompt
            </li>
            <li className="flex items-center">
              <span className="mr-4 text-2xl font-bold text-blue-500">4</span>
              Enjoy instant network access
            </li>
          </ol>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {renderSubscriptions()}
        </div>

        <div className="max-w-md mx-auto bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center">
            <QrCode className="mr-4 text-blue-600" />
            Voucher Login
          </h2>
          <div className="space-y-4">
            <Input placeholder="Voucher Code" className="w-full" />
            <Input placeholder="Username" className="w-full" />
            <Input placeholder="Password" type="password" className="w-full" />
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Login
            </Button>
          </div>
        </div>

        {/* Phone Number Modal */}
        <Dialog open={isPhoneModalOpen} onOpenChange={setIsPhoneModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-blue-800">
                {selectedSubscription
                  ? `${selectedSubscription.name} - Payment`
                  : "Select Payment"}
              </DialogTitle>
            </DialogHeader>
            {renderPaymentContent()}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default App;
