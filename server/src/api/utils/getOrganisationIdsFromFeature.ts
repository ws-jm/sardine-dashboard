import { FeatureFlag, AnyTodo } from "sardine-dashboard-typescript-definitions";

const mapSardineEnvToUnleaseEnv = (env?: string) => {
  switch (env) {
    case "producion":
      return ["prod"];
    default:
      return ["dev", "local"];
  }
};

export const getFeaturesMatchEnv = (features: FeatureFlag[]) => {
  const envs = mapSardineEnvToUnleaseEnv(process.env.SARDINE_ENV);
  console.log("getFeaturesMatchEnv with ENV:", envs.join(","));

  return features.filter((feature) =>
    feature.strategies.some((strategy) =>
      strategy.constraints.some((constraint) => {
        const isEnvironmentKey = constraint.contextName === "environment";
        if (!isEnvironmentKey) return false;

        return constraint.values.some((v) => envs.includes(v));
      })
    )
  );
};

export const getOrganisationIdsFromFeature = (feature: FeatureFlag) => {
  const transformedOrgIds = feature.strategies.reduce((orgIds: string[], strategy) => {
    const constraintOrgIds =
      strategy.constraints.find((constraint: AnyTodo) => constraint?.contextName === "userId")?.values || [];

    return orgIds.concat(constraintOrgIds);
  }, []);
  return transformedOrgIds;
};
