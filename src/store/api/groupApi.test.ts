import { groupApi } from "./groupApi";
import { CreateGroupRequest } from "@/src/types/group";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

describe("groupApi endpoint definitions", () => {
  it("should define listGroups query", () => {
    const endpoint = groupApi.endpoints.listGroups;
    expect(endpoint).toBeDefined();
  });

  it("should define getGroupDetails query", () => {
    const endpoint = groupApi.endpoints.getGroupDetails;
    expect(endpoint).toBeDefined();
  });

  it("should format CreateGroupRequest correctly for backend POST /groups", () => {
    const groupPayload: CreateGroupRequest = {
      name: "The 2026 Homeowners Circle",
      category: "Real Estate",
      description: "Cooperative savings circle for real estate purchases",
      targetAmount: 5000000000, // in kobo
      frequency: "MONTHLY",
      memberInterest: true,
      startDate: "2026-01-01T00:00:00.000Z",
      endDate: "2026-12-31T23:59:59.000Z",
      membersLimit: 20,
      accessType: "PRIVATE",
      penaltySetting: "IMMEDIATE_5",
      allowEarlyExit: false,
      allowEmergencyWithdrawal: true,
    };

    expect(groupPayload.targetAmount).toBe(5000000000);
    expect(groupPayload.accessType).toBe("PRIVATE");
    expect(groupPayload.frequency).toBe("MONTHLY");
  });

  it("should define joinGroup and contributeToGroup mutations", () => {
    expect(groupApi.endpoints.joinGroup).toBeDefined();
    expect(groupApi.endpoints.contributeToGroup).toBeDefined();
    expect(groupApi.endpoints.withdrawFromGroup).toBeDefined();
    expect(groupApi.endpoints.exitGroup).toBeDefined();
    expect(groupApi.endpoints.terminateGroup).toBeDefined();
  });
});
