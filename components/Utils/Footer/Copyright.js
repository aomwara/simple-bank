import { Text } from "@chakra-ui/layout";

export const Copyright = (props) => (
  <Text fontSize="sm" {...props}>
    &copy; {new Date().getFullYear()} Simple Bank, Inc. All rights reserved.
  </Text>
);
